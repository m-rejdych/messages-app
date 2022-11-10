import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { RoleType } from '@prisma/client';

import { router, protectedProcedure } from '../trpc';

export default router({
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(2, 'Space name needs to be at least 2 characters long.'),
      }),
    )
    .mutation(async ({ ctx: { prisma, userId }, input: { name } }) => {
      const matchedSpace = await prisma.space.findFirst({
        where: { creatorId: userId, name },
      });
      if (matchedSpace) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have a space with this name.',
        });
      }

      const role = await prisma.role.findUnique({
        where: { type: RoleType.Admin },
        include: { members: true },
      });
      if (!role) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Admin role not found.',
        });
      }

      const space = await prisma.space.create({
        data: { name, creatorId: userId },
      });

      await prisma.membership.create({
        data: { roleId: role.id, spaceId: space.id, userId: userId },
      });

      return space;
    }),
  list: protectedProcedure.query(async ({ ctx: { prisma, userId } }) => {
    const spaces = await prisma.space.findMany({
      where: { creatorId: userId },
      include: { creator: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return spaces;
  }),
});
