import { router } from '../trpc';
import authRouter from './auth';
import spaceRouter from './space';
import chatRouter from './chat';

export const appRouter = router({
  auth: authRouter,
  space: spaceRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
