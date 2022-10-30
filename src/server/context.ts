import { inferAsyncReturnType } from '@trpc/server';

import { prisma } from './prisma';

export const createContext = () => ({ prisma });

export type Context = inferAsyncReturnType<typeof createContext>;
