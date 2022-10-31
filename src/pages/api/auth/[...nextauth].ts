import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

import { prisma } from '../../../server/prisma';

export const opts: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'password',
        },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const { email, password } = credentials;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (!(await compare(password, user.password))) return null;

        return {
          id: user.id.toString(),
          email,
          name: user.username,
          image: null,
        };
      },
    }),
  ],
  session: {
    maxAge: 60 * 60,
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user?.id) token.id = parseInt(user.id, 10);
      return token;
    },
    session: ({ token, session }) => {
      return {
        ...session,
        user: { ...session.user, id: token.id, image: null },
      };
    },
  },
};

export default NextAuth(opts);
