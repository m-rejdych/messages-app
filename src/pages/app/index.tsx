import AppLayout from '../../layout/app';
import type { NextPageWithLayout } from '../../types/page';
import { trpc } from '../../utils/trpc';

import NoSpace from '../../components/space/noSpace';
import CreateSpaceButton from '../../components/space/createButton';
import JoinSpaceButton from '../../components/space/joinButton';
import SpacesList from '../../components/space/list';
import useAuthError from '../../hooks/useAuthError';

const App: NextPageWithLayout = () => {
  const onError = useAuthError();
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.space.list.useQuery(undefined, { onError });

  const invalidateListSpaces = (): void => {
    utils.space.list.invalidate();
  };

  if (!data?.length && !isLoading) {
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
          <JoinSpaceButton className="btn-sm" />
        </div>
      </div>
      <div className="divider" />
      <SpacesList
        action={{ text: 'Go!', navigate: { prefix: '/app/' } }}
        spaces={data}
        className="flex-1 overflow-auto"
      />
    </div>
  );
};

App.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps } from '../../utils/session';

export default App;
