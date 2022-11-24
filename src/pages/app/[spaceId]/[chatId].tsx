import { useRouter } from 'next/router';
import HashLoader from 'react-spinners/HashLoader';

import AppLayout from '../../../layout/app';
import SpaceLayout from '../../../layout/space';
import { getAuthedServerSideProps } from '../../../utils/session';
import { trpc } from '../../../utils/trpc';
import type { NextPageWithLayout } from '../../../types/page';

const Dm: NextPageWithLayout = () => {
  const { query } = useRouter();
  const { data, isInitialLoading, error } = trpc.chat.getDmById.useQuery({
    chatId: parseInt(query.chatId as string, 10),
    spaceId: parseInt(query.spaceId as string, 10),
  });

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

  return <div>{data.id}</div>;
};

Dm.getLayout = (page) => (
  <AppLayout>
    <SpaceLayout>{page}</SpaceLayout>
  </AppLayout>
);

export { getAuthedServerSideProps as getServerSideProps };

export default Dm;
