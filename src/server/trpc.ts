import { initTRPC, TRPCError } from '@trpc/server';

import type { Context } from './context';

const t = initTRPC.context<Context>().create();

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const membershipMiddleware = t.middleware(
  async ({ ctx, next, input }) => {
    const spaceIdInput = input as { spaceId?: number } | undefined;
    if (!spaceIdInput?.spaceId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: '"spaceId" parameter is required.',
      });
    }

    const { prisma, userId } = ctx;
    const { spaceId } = spaceIdInput;
    const membership = await prisma.membership.findFirst({
      where: { userId, spaceId },
    });
    if (!membership) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this space.',
      });
    }

    return next({ ctx: { ...ctx, membership } });
  },
);

export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
