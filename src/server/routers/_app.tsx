import { router } from '../trpc';
import authRouter from './auth';
import spaceRouter from './space';

export const appRouter = router({
  auth: authRouter,
  space: spaceRouter,
});

export type AppRouter = typeof appRouter;
