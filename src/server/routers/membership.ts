import { z } from 'zod';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';

export default router({
  findByUsername: protectedProcedure
    .input(
      z.object({
        spaceId: z.number(),
        username: z
          .string()
          .trim()
          .min(1, 'Username has to be at least 1 character long.'),
      }),
    )
    .use(membershipMiddleware)
    .query(
      async ({ ctx: { prisma, userId }, input: { spaceId, username } }) => {
        const members = await prisma.membership.findMany({
          where: {
            spaceId,
            user: {
              NOT: { id: userId },
              profile: {
                displayName: { contains: username, mode: 'insensitive' },
              },
            },
          },
          select: {
            id: true,
            user: {
              select: {
                profile: { select: { displayName: true } },
              },
            },
          },
        });

        return members;
      },
    ),
});
