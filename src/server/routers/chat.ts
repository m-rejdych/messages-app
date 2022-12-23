import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ChatTypeName } from '@prisma/client';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';

export default router({
  getById: protectedProcedure
    .input(z.object({ spaceId: z.number(), chatId: z.number() }))
    .use(membershipMiddleware)
    .query(async ({ ctx: { prisma }, input: { spaceId, chatId } }) => {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true } },
                },
              },
            },
          },
        },
      });
      if (!chat) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found.' });
      }
      if (chat.spaceId !== spaceId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This chat is not a part of the space.',
        });
      }

      return chat;
    }),
  getDms: protectedProcedure
    .input(z.object({ spaceId: z.number() }))
    .use(membershipMiddleware)
    .query(async ({ ctx: { prisma, membership } }) => {
      const chatType = await prisma.chatType.findUnique({
        where: { name: ChatTypeName.DirectMessage },
      });
      if (!chatType) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Chat type not found.',
        });
      }

      const dms = await prisma.chat.findMany({
        where: {
          chatTypeId: chatType.id,
          members: { some: { memberId: membership.id } },
        },
        select: {
          id: true,
          members: {
            select: {
              member: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return dms;
    }),
  getOrCreateDmByMemberId: protectedProcedure
    .input(z.object({ spaceId: z.number(), memberId: z.number() }))
    .use(membershipMiddleware)
    .mutation(
      async ({ ctx: { prisma, membership }, input: { spaceId, memberId } }) => {
        const matchedChat = await prisma.chat.findFirst({
          where: {
            spaceId,
            type: { name: ChatTypeName.DirectMessage },
            AND: [
              { members: { some: { memberId: membership.id } } },
              { members: { some: { memberId } } },
            ],
          },
        });

        if (matchedChat) return matchedChat;

        const otherMembership = await prisma.membership.findFirst({
          where: { id: memberId, spaceId },
        });
        if (!otherMembership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Member with this id does not exist in the space.',
          });
        }

        const chatType = await prisma.chatType.findUnique({
          where: { name: ChatTypeName.DirectMessage },
          select: { id: true },
        });
        if (!chatType) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Chat type not found.',
          });
        }

        const chat = await prisma.chat.create({
          data: { chatTypeId: chatType.id, spaceId },
        });

        await prisma.chatsOnMemberships.createMany({
          data: [
            { chatId: chat.id, memberId },
            { chatId: chat.id, memberId: membership.id },
          ],
        });

        return chat;
      },
    ),
  createChannel: protectedProcedure
    .input(
      z.object({
        spaceId: z.number(),
        name: z
          .string()
          .trim()
          .min(2, 'Channel name have to be at least 2 characters long.'),
      }),
    )
    .use(membershipMiddleware)
    .mutation(
      async ({ ctx: { prisma, membership }, input: { spaceId, name } }) => {
        const chatType = await prisma.chatType.findUnique({
          where: { name: ChatTypeName.Channel },
        });
        if (!chatType) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Chat type not found.',
          });
        }

        const channel = await prisma.chat.create({
          data: { spaceId, name, chatTypeId: chatType.id },
        });
        await prisma.chatsOnMemberships.create({
          data: { chatId: channel.id, memberId: membership.id },
        });

        return channel;
      },
    ),
});
