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
  list: protectedProcedure.query(async ({ ctx: { prisma, userId } }) => {
    const spaces = await prisma.space.findMany({
      where: { OR: [{ creatorId: userId }, { members: { some: { userId } } }] },
      include: {
        creator: { select: { id: true, username: true } },
        members: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return spaces;
  }),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx: { userId, prisma }, input }) => {
      const space = await prisma.space.findUnique({
        where: { id: input },
        include: {
          members: {
            select: {
              id: true,
              role: true,
              user: { select: { username: true, id: true } },
            },
          },
        },
      });
      if (!space) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Space not found.' });
      }
      if (!space.members.some(({ user: { id } }) => id === userId)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this space.',
        });
      }

      return space;
    }),
  searchPublicByName: protectedProcedure
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
              id: true,
              username: true,
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
