import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ChatTypeName } from '@prisma/client';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';

export default router({
  getDirectMessage: protectedProcedure
    .input(z.object({ spaceId: z.number(), memberId: z.number() }))
    .use(membershipMiddleware)
    .query(
      async ({ ctx: { prisma, membership }, input: { spaceId, memberId } }) => {
        const chat = await prisma.chat.findFirst({
          where: {
            spaceId,
            type: { name: ChatTypeName.DirectMessage },
            AND: [
              { members: { some: { memberId: membership.id } } },
              { members: { some: { memberId } } },
            ],
          },
        });

        return chat;
      },
    ),
  createDirectMessage: protectedProcedure
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
        if (matchedChat) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Chat with this member already exists.',
          });
        }

        const otherMembership = await prisma.membership.findUnique({
          where: { id: memberId },
        });
        if (!otherMembership || membership.spaceId !== spaceId) {
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
});
