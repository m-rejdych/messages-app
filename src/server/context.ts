import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';

import { prisma } from './prisma';
import { pusher } from './pusher';
import { getSession } from '../utils/session';

export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getSession(opts);

  return {
    prisma,
    pusher,
    userId: session?.user.id,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
