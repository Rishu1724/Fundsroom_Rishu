import { Response } from 'express';

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ data });
}

export function fail(res: Response, status: number, message: string, details?: unknown) {
  return res.status(status).json({ error: { message, details } });
}