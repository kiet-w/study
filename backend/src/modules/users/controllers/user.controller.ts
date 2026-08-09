import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../../../shared/types/common.types';

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = await userService.createUser(req.body);
    const response: ApiResponse = {
      success: true,
      message: 'User created successfully',
      data: user,
    };
    return res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

export const getUsersController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const users = await userService.getUsers();
    const response: ApiResponse = {
      success: true,
      data: users,
    };
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
