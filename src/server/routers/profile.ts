import { TRPCError } from '@trpc/server';

import { router, protectedProcedure } from '../trpc';

export default router({
  getProfile: protectedProcedure.query(async ({ ctx: { prisma, userId } }) => {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { username: true, email: true } } },
    });
    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found.' });
    }

    return profile;
  }),
});
