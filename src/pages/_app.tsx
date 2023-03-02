import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { trpc } from '../utils/trpc';
import { getTheme } from '../utils/theme';
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
  useEffect(() => {
    const html = document.querySelector('html');
    if (!html) return;

    const theme = getTheme();

    localStorage.setItem('theme', theme);
    html.setAttribute('data-theme', theme);
  }, []);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
    </SessionProvider>
  );
};

export default trpc.withTRPC(App);
