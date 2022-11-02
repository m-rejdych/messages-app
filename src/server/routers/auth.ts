import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';

import { router, procedure } from '../trpc';
import { PASSWORD_REGEXP } from '../../constants/auth/form';

export default router({
  register: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z
          .string()
          .regex(
            PASSWORD_REGEXP,
            'Password should be at least 6 characters long and contain digit and special character.',
          ),
        username: z
          .string()
          .min(3, 'Username should be at least 3 characters long.'),
      }),
    )
    .mutation(
      async ({ input: { email, password, username }, ctx: { prisma } }) => {
        const matchedUser = await prisma.user.findUnique({ where: { email } });
        if (matchedUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This email is already in use.',
          });
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
          data: { email, password: hashedPassword, username },
          select: { email: true, id: true, username: true },
        });

        return user;
      },
    ),
});
