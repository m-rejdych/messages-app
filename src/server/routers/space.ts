import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { RoleType } from '@prisma/client';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';

export default router({
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(2, 'Space name needs to be at least 2 characters long.'),
        isPrivate: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx: { prisma, userId }, input: { name, ...rest } }) => {
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
      });
      if (!role) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Admin role not found.',
        });
      }

      const space = await prisma.space.create({
        data: { name, creatorId: userId, ...rest },
      });

      await prisma.membership.create({
        data: { roleId: role.id, spaceId: space.id, userId: userId },
      });

      return space;
    }),
  list: protectedProcedure
    .input(
      z.object({
        take: z.number(),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx: { prisma, userId }, input: { cursor, take } }) => {
      const spaces = await prisma.space.findMany({
        where: {
          OR: [{ creatorId: userId }, { members: { some: { userId } } }],
        },
        include: {
          creator: { select: { profile: { select: { displayName: true } } } },
          members: { select: { userId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
      });

      return {
        spaces,
        cursor:
          spaces.length && spaces.length >= take
            ? spaces[spaces.length - 1].id
            : undefined,
      };
    }),
  getById: protectedProcedure
    .input(z.object({ spaceId: z.number() }))
    .use(membershipMiddleware)
    .query(async ({ ctx: { prisma }, input: { spaceId } }) => {
      const space = await prisma.space.findUnique({
        where: { id: spaceId },
      });
      if (!space) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Space not found.' });
      }

      return space;
    }),
  findPublicByName: protectedProcedure
    .input(z.string().trim().min(1, 'Space name can not be empty.'))
    .query(async ({ ctx: { prisma }, input }) => {
      const spaces = await prisma.space.findMany({
        where: {
          name: { mode: 'insensitive', contains: input },
          isPrivate: false,
        },
        include: {
          creator: {
            select: {
              profile: { select: { displayName: true } },
            },
          },
          members: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return spaces;
    }),
  join: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx: { userId, prisma }, input }) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      const space = await prisma.space.findUnique({
        where: { id: input },
        include: { members: { select: { userId: true } } },
      });
      if (!space) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Space not found.' });
      }
      if (space.isPrivate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This space is private.',
        });
      }
      if (space.members.some(({ userId: memberId }) => userId === memberId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already a member of this space.',
        });
      }

      const role = await prisma.role.findUnique({
        where: { type: RoleType.Chatter },
      });
      if (!role) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Role not found.',
        });
      }

      await prisma.membership.create({
        data: { roleId: role.id, spaceId: space.id, userId },
      });

      return space;
    }),
});
