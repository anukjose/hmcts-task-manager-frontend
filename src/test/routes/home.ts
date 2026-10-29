import { app } from '../../main/app';

import axios from 'axios';
import request from 'supertest';

jest.mock('axios');

describe('Home page', () => {
  describe('on GET', () => {
    test('should return the home page with tasks', async () => {
      // Mock the backend response so the test does not need a running backend.
      jest.mocked(axios.get).mockResolvedValueOnce({
        data: [
          {
            id: 1,
            title: 'Review case documents',
            description: 'Review submitted documents',
            status: 'TODO',
            dueDateTime: null,
          },
        ],
      } as Awaited<ReturnType<typeof axios.get>>);

      const response = await request(app).get('/').expect(200);

      // Verify that the task is displayed on the page.
      expect(response.text).toContain('Review case documents');
    });

    test('should show an error when the backend is unavailable', async () => {
      // Simulate a backend failure.
      jest.mocked(axios.get).mockRejectedValueOnce(new Error('Backend unavailable'));

      const response = await request(app).get('/').expect(502);

      // Verify that the user receives a meaningful error message.
      expect(response.text).toContain('Unable to load tasks');
    });
  });
});
