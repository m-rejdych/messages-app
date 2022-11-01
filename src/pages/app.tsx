import { useSession } from 'next-auth/react';

import AppLayout from '../layout/app';
import type { NextPageWithLayout } from '../types/page';

const App: NextPageWithLayout = () => {
  const { data } = useSession();
  console.log(data);

  return <div>App</div>;
};

App.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps } from '../utils/session';

export default App;
