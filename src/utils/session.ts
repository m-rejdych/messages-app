import type {
  NextApiRequest,
  NextApiResponse,
  GetServerSidePropsContext,
  GetServerSideProps,
} from 'next';
import { unstable_getServerSession, type Session } from 'next-auth';

import { opts } from '../pages/api/auth/[...nextauth]';

interface GetSessionOpts {
  req: NextApiRequest | GetServerSidePropsContext['req'];
  res: NextApiResponse | GetServerSidePropsContext['res'];
}

export const getSession = async ({
  req,
  res,
}: GetSessionOpts): Promise<Session | null> => {
  const session = await unstable_getServerSession(req, res, opts);

  return session;
};

export const getAuthedServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const session = await getSession({ req, res });

  if (!session) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${resolvedUrl}`,
      },
      props: { session },
    };
  }

  return {
    props: { session },
  };
};

export const getUnauthedServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getSession({ req, res });

  if (session) {
    return {
      redirect: {
        destination: query.callbackUrl ?? '/app',
      },
      props: { session },
    };
  }

  return { props: { session } };
};
