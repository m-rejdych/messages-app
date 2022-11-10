import AppLayout from '../../layout/app';
import Link from 'next/link';
import type { NextPageWithLayout } from '../../types/page';
import { trpc } from '../../utils/trpc';

import NoSpace from '../../components/space/noSpace';
import CreateSpaceButton from '../../components/space/createButton';
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
      <div className="flex-1 overflow-auto">
        {data.map(({ id, name, creator: { username } }) => (
          <div
            key={id}
            className="card w-full bg-base-100 shadow-xl [&:not(:last-child)]:mb-4"
          >
            <div className="card-body">
              <h2 className="card-title">{name}</h2>
              <p className="text-secondary text-md">
                Created by <span className="font-bold">{username}</span>
              </p>
              <div className="card-actions justify-end">
                <Link
                  href={`/app/space/${id}`}
                  className="btn btn-primary btn-outline"
                >
                  Go!
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

App.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps } from '../../utils/session';

export default App;
