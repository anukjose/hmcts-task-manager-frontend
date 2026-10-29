
import axios from 'axios';
import { Application } from 'express';

// Data submitted by the task creation form.
interface CreateTaskRequest {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDateTime?: string;
}

export default function (app: Application): void {
  // Display the task creation form.
  app.get('/tasks/new', (req, res) => {
    res.render('tasks/new', {
      errors: {},
      formData: {
        title: '',
        description: '',
        status: 'TODO',
        dueDateTime: '',
      },
    });
  });

  // Submit the form to the Spring Boot API.
  app.post('/tasks', async (req, res) => {
    const formData = {
      title: String(req.body.title ?? '').trim(),
      description: String(req.body.description ?? '').trim(),
      status: String(req.body.status ?? 'TODO'),
      dueDateTime: String(req.body.dueDateTime ?? ''),
    };

    const errors: Record<string, string> = {};

    // Validate the title before sending the request.
    if (!formData.title) {
      errors.title = 'Enter a task title';
    } else if (formData.title.length > 200) {
      errors.title = 'The title must be 200 characters or fewer';
    }

    // Validate the description length.
    if (formData.description.length > 5000) {
      errors.description =
        'The description must be 5000 characters or fewer';
    }

    // Only accept statuses supported by the backend.
    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Select a valid task status';
    }

    // Validate the optional due date and convert it to LocalDateTime format.
    let dueDateTime: string | undefined;

    if (formData.dueDateTime) {
      const parsedDate = new Date(formData.dueDateTime);

      if (Number.isNaN(parsedDate.getTime())) {
        errors.dueDateTime = 'Enter a valid due date';
      } else {
        // Convert the browser date to YYYY-MM-DDTHH:mm.
        dueDateTime = formData.dueDateTime;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('tasks/new', {
        errors,
        formData,
      });
    }

    const requestBody: CreateTaskRequest = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status as CreateTaskRequest['status'],
      dueDateTime,
    };

    try {
      await axios.post(
        'http://localhost:4000/api/tasks',
        requestBody,
      );

      // Return to the task list after successful creation.
      return res.redirect('/');
    } catch (error) {
      console.error('Error creating task:', error);

      return res.status(502).render('tasks/new', {
        errors: {
          general: 'Unable to create the task. Please try again.',
        },
        formData,
      });
    }
  });

    // Update a task's status using the existing Spring Boot API.
  app.post('/tasks/:id/status', async (req, res) => {
    const taskId = Number(req.params.id);
    const status = String(req.body.status ?? '');

    // Only allow the three statuses supported by the backend.
    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

    if (!Number.isInteger(taskId) || taskId <= 0 ||
        !validStatuses.includes(status)) {
      return res.redirect('/');
    }

    try {
      await axios.patch(
        `http://localhost:4000/api/tasks/${taskId}/status`,
        { status },
      );

      return res.redirect('/');
    } catch (error) {
      console.error('Error updating task status:', error);
      return res.status(502).send('Unable to update the task status.');
    }
  });

  // Delete a task using the existing Spring Boot API.
  app.post('/tasks/:id/delete', async (req, res) => {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.redirect('/');
    }

    try {
      await axios.delete(
        `http://localhost:4000/api/tasks/${taskId}`,
      );

      return res.redirect('/');
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(502).send('Unable to delete the task.');
    }
  });
}
