import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt';
import { fail } from '../lib/http';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
    name: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return fail(res, 401, 'Unauthorized');
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return fail(res, 401, 'Invalid or expired token');
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return fail(res, 401, 'Unauthorized');
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      return fail(res, 403, 'Forbidden');
    }
    next();
  };
}