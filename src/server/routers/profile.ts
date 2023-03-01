import { TRPCError } from '@trpc/server';
import { z } from 'zod';

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
  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z
          .string()
          .trim()
          .min(3, 'Display name should be at least 3 characters long.')
          .optional(),
      }),
    )
    .mutation(async ({ ctx: { userId, prisma }, input }) => {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found.',
        });
      }

      const updatedProfile = await prisma.profile.update({
        where: { id: profile.id },
        data: input,
        include: { user: { select: { username: true, email: true } } },
      });

      return updatedProfile;
    }),
});
