import { z } from 'zod';

import { router, procedure } from '../trpc';

export const appRouter = router({
  hello: procedure
    .input(z.object({ name: z.string() }).optional())
    .query(({ input }) => {
      return `Hello ${input?.name ?? 'world'}`;
    }),
});

export type AppRouter = typeof appRouter;
