import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';
import { Event } from '../../types/events';

export default router({
  send: protectedProcedure
    .input(
      z.object({
        chatId: z.number(),
        spaceId: z.number(),
        content: z
          .string()
          .trim()
          .min(1, 'Message content needs to be at least 1 character long.'),
      }),
    )
    .use(membershipMiddleware)
    .mutation(
      async ({
        ctx: { prisma, pusher, membership },
        input: { spaceId, chatId, content },
      }) => {
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          select: {
            id: true,
            spaceId: true,
            space: { select: { members: { select: { id: true } } } },
            members: { select: { memberId: true } },
          },
        });
        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found. ',
          });
        }
        if (spaceId !== chat.spaceId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '"spaceId" parameter does not match chat\'s space id.',
          });
        }
        if (!chat.members.some(({ memberId }) => memberId === membership.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not a member of this chat.',
          });
        }

        const message = await prisma.message.create({
          data: { authorId: membership.id, content, chatId: chat.id },
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
        });

        pusher.trigger(
          `private-sp-${spaceId}-ch-${chatId}`,
          Event.NewMessage,
          message,
        );

        return message;
      },
    ),
});
