import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';
import type { ChatTypeName, ChatType } from '@prisma/client';

export const getChatType = async (
  prisma: PrismaClient,
  name: ChatTypeName,
): Promise<ChatType> => {
  const chatType = await prisma.chatType.findUnique({ where: { name } });
  if (!chatType) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Chat type not found.',
    });
  }

  return chatType;
};
