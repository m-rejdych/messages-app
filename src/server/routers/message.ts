import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router, protectedProcedure, membershipMiddleware } from '../trpc';

export default router({
  send: protectedProcedure
    .input(
      z.object({
        spaceId: z.number(),
        chatId: z.number(),
        content: z
          .string()
          .trim()
          .min(1, 'Message content needs to be at least 1 character long.'),
      }),
    )
    .use(membershipMiddleware)
    .mutation(
      async ({
        ctx: { prisma, membership },
        input: { spaceId, chatId, content },
      }) => {
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          select: {
            id: true,
            spaceId: true,
            members: { select: { memberId: true } },
          },
        });
        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found. ',
          });
        }
        if (chat.spaceId !== spaceId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '"spaceId" paramater does not match chat\'s space.',
          });
        }
        if (
          !chat.members.length ||
          !chat.members.some(({ memberId }) => memberId === membership.id)
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not a member of this chat.',
          });
        }

        const message = await prisma.message.create({
          data: { authorId: membership.id, content, chatId: chat.id },
        });

        // TODO: SEND WEBSOCKET MESSAGE

        return message;
      },
    ),
});
