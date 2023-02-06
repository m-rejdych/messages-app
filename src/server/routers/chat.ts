import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ChatTypeName } from '@prisma/client';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';
import { getChatType } from '../../utils/chatType';

export default router({
  getById: protectedProcedure
    .input(
      z.object({
        spaceId: z.number(),
        chatId: z.number(),
        cursor: z.number().optional(),
        take: z.number(),
      }),
    )
    .use(membershipMiddleware)
    .query(
      async ({
        ctx: { prisma, membership },
        input: { spaceId, chatId, cursor, take },
      }) => {
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          include: {
            messages: {
              cursor: cursor
                ? {
                    id: cursor,
                  }
                : undefined,
              take: take,
              skip: cursor ? 1 : 0,
              select: {
                id: true,
                content: true,
                author: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        id: true,
                        profile: { select: { displayName: true } },
                      },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
            members: {
              select: {
                memberId: true,
              },
            },
          },
        });
        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found.',
          });
        }
        if (chat.spaceId !== spaceId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This chat is not a part of the space.',
          });
        }
        if (!chat.members.some(({ memberId }) => memberId === membership.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not a member of this chat.',
          });
        }

        return {
          chat,
          cursor:
            chat.messages.length && chat.messages.length >= take
              ? chat.messages[chat.messages.length - 1].id
              : undefined,
        };
      },
    ),
  getDms: protectedProcedure
    .input(z.object({ spaceId: z.number() }))
    .use(membershipMiddleware)
    .query(async ({ ctx: { prisma, membership }, input: { spaceId } }) => {
      const chatType = await getChatType(prisma, ChatTypeName.DirectMessage);

      const dms = await prisma.chat.findMany({
        where: {
          spaceId,
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
                      profile: { select: { displayName: true } },
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
  getChannels: protectedProcedure
    .input(z.object({ spaceId: z.number() }))
    .use(membershipMiddleware)
    .query(async ({ ctx: { prisma, membership }, input: { spaceId } }) => {
      const chatType = await getChatType(prisma, ChatTypeName.Channel);

      const channels = await prisma.chat.findMany({
        where: {
          spaceId,
          chatTypeId: chatType.id,
          members: { some: { memberId: membership.id } },
        },
        select: {
          id: true,
          name: true,
        },
      });

      return channels;
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

        const chatType = await getChatType(prisma, ChatTypeName.DirectMessage);

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
  findPublicChannelByName: protectedProcedure
    .input(
      z.object({
        spaceId: z.number(),
        name: z
          .string()
          .trim()
          .min(1, 'Channel name has to be at least 1 character long.'),
      }),
    )
    .use(membershipMiddleware)
    .query(async ({ ctx: { prisma }, input: { spaceId, name } }) => {
      const chatType = await getChatType(prisma, ChatTypeName.Channel);

      const channels = await prisma.chat.findMany({
        where: {
          spaceId,
          isPrivate: false,
          chatTypeId: chatType.id,
          name: { contains: name, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          members: {
            select: {
              member: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      return channels;
    }),
  createChannel: protectedProcedure
    .input(
      z.object({
        spaceId: z.number(),
        isPrivate: z.boolean().optional(),
        name: z
          .string()
          .trim()
          .min(2, 'Channel name have to be at least 2 characters long.'),
      }),
    )
    .use(membershipMiddleware)
    .mutation(
      async ({ ctx: { prisma, membership }, input: { spaceId, ...rest } }) => {
        const chatType = await getChatType(prisma, ChatTypeName.Channel);

        const channel = await prisma.chat.create({
          data: { spaceId, chatTypeId: chatType.id, ...rest },
        });
        await prisma.chatsOnMemberships.create({
          data: { chatId: channel.id, memberId: membership.id },
        });

        return channel;
      },
    ),
  joinPublicChannel: protectedProcedure
    .input(z.object({ spaceId: z.number(), channelId: z.number() }))
    .use(membershipMiddleware)
    .mutation(
      async ({
        ctx: { prisma, membership },
        input: { spaceId, channelId },
      }) => {
        const chatType = await getChatType(prisma, ChatTypeName.Channel);

        const channel = await prisma.chat.findFirst({
          where: { spaceId, id: channelId },
          select: {
            id: true,
            isPrivate: true,
            chatTypeId: true,
            members: { select: { memberId: true } },
          },
        });
        if (!channel) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Channel not found.',
          });
        }
        if (channel.chatTypeId !== chatType.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This chat is not a channel.',
          });
        }
        if (
          channel.members.some(({ memberId }) => memberId === membership.id)
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You are already a member of this channel.',
          });
        }
        if (channel.isPrivate) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'This channel is private.',
          });
        }

        await prisma.chatsOnMemberships.create({
          data: { memberId: membership.id, chatId: channel.id },
        });

        return channel;
      },
    ),
});
