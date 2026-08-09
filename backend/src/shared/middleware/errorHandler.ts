import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/common.types';

export interface CustomError extends Error {
  statusCode?: number;
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response | void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  return res.status(statusCode).json(response);
};

export default errorHandler;
