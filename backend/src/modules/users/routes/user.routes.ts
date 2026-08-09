import { Router } from 'express';
import { createUserController, getUsersController } from '../controllers/user.controller';
import { validateCreateUser } from '../middleware/user.middleware';

const router = Router();

router.post('/', validateCreateUser, createUserController);
router.post('/create', validateCreateUser, createUserController);
router.get('/', getUsersController);

export default router;
