import AppLayout from '../../layout/app';
import type { NextPageWithLayout } from '../../types/page';

import NoSpace from '../../components/space/noSpace';

const App: NextPageWithLayout = () => {
  return <NoSpace className="h-full" />;
};

App.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps } from '../../utils/session';

export default App;
