import { useRouter } from 'next/router';
import HashLoader from 'react-spinners/HashLoader';

import type { NextPageWithLayout } from '../../../types/page';
import AppLayout from '../../../layout/app';
import useAuthError from '../../../hooks/useAuthError';
import { trpc } from '../../../utils/trpc';

const Space: NextPageWithLayout = () => {
  const onError = useAuthError();
  const { query } = useRouter();
  const { data, isInitialLoading, error } = trpc.space.getById.useQuery(
    parseInt(query.id as string, 10),
    { onError },
  );

  if (isInitialLoading) {
    return (
      <div className="h-full grid place-items-center">
        <HashLoader size={150} color="#3abff8" loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full grid place-items-center">
        <h1 className="text-4xl">
          {error.shape?.data.httpStatus === 404
            ? 'Space not found'
            : error.message}
        </h1>
      </div>
    );
  }

  if (!data) return null;

  return <h1>{data.members.map(({ user: { username } }) => username)}</h1>;
};

Space.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Space;
