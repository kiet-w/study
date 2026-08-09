import { Request, Response, NextFunction } from 'express';
import { CreateUserDto } from '../types/user.types';
import { ApiResponse } from '../../../shared/types/common.types';

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { email, username, password } = (req.body || {}) as Partial<CreateUserDto>;
  const errors: string[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Valid email is required');
  }

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters long');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  if (errors.length > 0) {
    const response: ApiResponse = {
      success: false,
      error: errors.join(', '),
      details: errors,
    };
    return res.status(400).json(response);
  }

  next();
};
