import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from './models';

const SECRET = process.env.JWT_SECRET || '';
if (SECRET.length < 16) throw new Error('JWT_SECRET must be set (16+ chars) in .env');

export const signToken = (id: string, role: string) =>
  jwt.sign({ sub: id, role }, SECRET, { expiresIn: '7d' });

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Attaches req.user (loaded fresh from DB so blocked accounts lose access immediately)
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    if (!token) throw new HttpError(401, 'Authentication required.');
    let payload: any;
    try {
      payload = jwt.verify(token, SECRET);
    } catch {
      throw new HttpError(401, 'Session expired or invalid. Please sign in again.');
    }
    const user = await User.findById(payload.sub);
    if (!user) throw new HttpError(401, 'Account no longer exists.');
    if (user.status === 'blocked') throw new HttpError(403, 'Your account has been suspended by the administrator.');
    (req as any).user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if ((req as any).user?.role !== 'admin') return next(new HttpError(403, 'Administrator access required.'));
  next();
}
