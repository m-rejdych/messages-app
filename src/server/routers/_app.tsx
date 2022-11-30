import { router } from '../trpc';
import authRouter from './auth';
import spaceRouter from './space';
import chatRouter from './chat';
import messageRouter from './message';

export const appRouter = router({
  auth: authRouter,
  space: spaceRouter,
  chat: chatRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
