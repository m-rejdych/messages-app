import { httpBatchLink } from '@trpc/client';
import { inferRouterOutputs } from '@trpc/server';
import { createTRPCNext } from '@trpc/next';

import type { AppRouter } from '../server/routers/_app';

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') return '';

  return process.env.URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers: {
            cookie: ctx?.req?.headers.cookie ?? '',
          },
        }),
      ],
    };
  },
  ssr: true,
});

export type RouterOutputs = inferRouterOutputs<AppRouter>;
