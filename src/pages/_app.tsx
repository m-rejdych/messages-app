import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { trpc } from '../utils/trpc';
import RootLayout from '../layout';
import '../styles/globals.css';
import type { NextPageWithLayout } from '../types/page';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
    </SessionProvider>
  );
};

export default trpc.withTRPC(App);
