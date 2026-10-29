
import axios from 'axios';
import { Application } from 'express';

// Represents one task returned by the Spring Boot API.
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDateTime: string | null;
}

export default function (app: Application): void {
  app.get('/', async (req, res) => {
    try {
      // Fetch real tasks from the Spring Boot backend.
      const response = await axios.get<Task[]>(
        'http://localhost:4000/api/tasks',
      );

      // Pass the tasks to the Nunjucks template.
      res.render('home', {
        tasks: response.data,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);

      // Show an error message instead of silently showing an empty list.
      res.status(502).render('home', {
        tasks: [],
        error: 'Unable to load tasks. Please try again later.',
      });
    }
  });
}
