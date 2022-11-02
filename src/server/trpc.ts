import { initTRPC, TRPCError } from '@trpc/server';

import type { Context } from './context';

const t = initTRPC.context<Context>().create();

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
