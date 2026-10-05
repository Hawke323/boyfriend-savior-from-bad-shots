import { Router } from 'express';

export const helloRouter = Router();

helloRouter.post('/hello', (_req, res) => {
  res.json({ message: 'hello world' });
});
