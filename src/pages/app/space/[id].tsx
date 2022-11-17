import { useRouter } from 'next/router';

import type { NextPageWithLayout } from '../../../types/page';
import AppLayout from '../../../layout/app';
import SpaceLayout from '../../../layout/space';

const Space: NextPageWithLayout = () => {
  const { query } = useRouter();

  return <h1>{query.id}</h1>;
};

Space.getLayout = (page) => (
  <AppLayout>
    <SpaceLayout>{page}</SpaceLayout>
  </AppLayout>
);

export default Space;
