import type { FC } from 'react';
import { useRouter } from 'next/router';
import HashLoader from 'react-spinners/HashLoader';

import useAuthError from '../../hooks/useAuthError';
import Sidebar from './sidebar';
import { trpc } from '../../utils/trpc';

interface Props {
  children: React.ReactNode;
}

const SpaceLayout: FC<Props> = ({ children }) => {
  const { query } = useRouter();
  const onError = useAuthError();
  const spaceId = parseInt(query.spaceId as string, 10);
  const { data, isInitialLoading, error } = trpc.space.getById.useQuery(
    { spaceId },
    { onError, retry: false, refetchOnWindowFocus: false },
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

  return (
    <div className="flex items-start h-full py-8">
      <Sidebar id={spaceId} name={data.name} members={data.members} />
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
};

export default SpaceLayout;
