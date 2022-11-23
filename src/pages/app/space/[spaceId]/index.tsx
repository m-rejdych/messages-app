import AppLayout from '../../../../layout/app';
import SpaceLayout from '../../../../layout/space';
import { getAuthedServerSideProps } from '../../../../utils/session';
import type { NextPageWithLayout } from '../../../../types/page';

const Space: NextPageWithLayout = () => (
  <div className="h-full grid place-items-center">
    <h1 className="text-2xl text-secondary">
      Pick a chat to start conversation
    </h1>
  </div>
);

Space.getLayout = (page) => (
  <AppLayout>
    <SpaceLayout>{page}</SpaceLayout>
  </AppLayout>
);

export { getAuthedServerSideProps as getServerSideProps };

export default Space;
