import AppLayout from '../../layout/app';
import Link from 'next/link';
import type { NextPageWithLayout } from '../../types/page';
import { trpc } from '../../utils/trpc';

import NoSpace from '../../components/space/noSpace';
import CreateSpaceButton from '../../components/space/createButton';
import SpacesList from '../../components/space/list';
import useAuthError from '../../hooks/useAuthError';

const App: NextPageWithLayout = () => {
  const onError = useAuthError();
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.space.list.useQuery(undefined, { onError });

  const invalidateListSpaces = (): void => {
    utils.space.list.invalidate();
  };

  if (!data && !isLoading) {
    return <NoSpace onCreate={invalidateListSpaces} className="h-full" />;
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="h-full flex flex-col px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Your spaces</h1>
        <div className="flex flex-col sm:flex-row">
          <CreateSpaceButton
            onCreate={invalidateListSpaces}
            className="btn-sm mb-2 sm:mb-0 sm:mr-2"
          />
          <button className="btn btn-secondary btn-sm">Join space</button>
        </div>
      </div>
      <div className="divider" />
      <SpacesList spaces={data} className="flex-1 overflow-auto" />
    </div>
  );
};

App.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps } from '../../utils/session';

export default App;
