import { useRouter } from 'next/router';
import HashLoader from 'react-spinners/HashLoader';
import { inferProcedureOutput } from '@trpc/server';

import type { NextPageWithLayout } from '../../../types/page';
import AppLayout from '../../../layout/app';
import Sidebar from '../../../components/space/sidebar';
import useAuthError from '../../../hooks/useAuthError';
import { trpc } from '../../../utils/trpc';

type Space = inferProcedureOutput<''>;

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

  return (
    <div className="flex items-start h-full py-8">
      <Sidebar name={data.name} members={data.members} />
      <div className="flex-1 h-full" />
    </div>
  );
};

Space.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Space;
