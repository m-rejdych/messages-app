import { router } from '../trpc';
import authRouter from './auth';
import spaceRouter from './space';
import chatRouter from './chat';
import messageRouter from './message';
import membershipRouter from './membership';
import profileRouter from './profile';

export const appRouter = router({
  auth: authRouter,
  space: spaceRouter,
  chat: chatRouter,
  message: messageRouter,
  membership: membershipRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
