import { Router } from 'express';
import userRoutes from './modules/users/routes/user.routes';

const appRouter = Router();

/**
 * Main application module router.
 * Aggregates all feature module routes under the central router.
 */

// User module routes -> /api/users
appRouter.use('/users', userRoutes);

// Future module routes can be registered here cleanly:
// appRouter.use('/subjects', subjectRoutes);
// appRouter.use('/photos', photoRoutes);

export default appRouter;
