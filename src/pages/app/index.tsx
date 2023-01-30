import { useRef, useEffect } from 'react';

import AppLayout from '../../layout/app';
import { trpc } from '../../utils/trpc';
import NoSpace from '../../components/space/noSpace';
import CreateSpaceButton from '../../components/space/createButton';
import JoinSpaceButton from '../../components/space/joinButton';
import SpacesList, { type Space } from '../../components/space/list';
import useAuthError from '../../hooks/useAuthError';
import type { NextPageWithLayout } from '../../types/page';

const TAKE = 10 as const;

const App: NextPageWithLayout = () => {
  const onError = useAuthError();
  const utils = trpc.useContext();
  const lastSpaceRef = useRef<HTMLLIElement | null>(null);
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.space.list.useInfiniteQuery(
      { take: TAKE },
      {
        onError,
        keepPreviousData: true,
        getNextPageParam: (page) => page.cursor,
      },
    );

  useEffect(() => {
    if (!lastSpaceRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;

      fetchNextPage();
      observer.unobserve(entry.target);
    });
    observer.observe(lastSpaceRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage]);

  const invalidateListSpaces = (): void => {
    utils.space.list.invalidate({ take: TAKE });
  };

  if (!data?.pages.some(({ spaces }) => spaces.length) && !isLoading) {
    return <NoSpace onCreate={invalidateListSpaces} className="h-full" />;
  }

  if (isLoading) return <p>Loading...</p>;

  const spaces = data.pages.reduce<Space[]>(
    (acc, { spaces }) => [...acc, ...spaces],
    [],
  );

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
        spaces={spaces}
        className="flex-1 overflow-auto"
        lastItemRef={lastSpaceRef}
      />
    </div>
  );
};

App.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps } from '../../utils/session';

export default App;
