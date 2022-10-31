import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { trpc } from '../utils/trpc';
import '../styles/globals.css';
import RootLayout from '../layout';

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  return (
    <SessionProvider session={session}>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </SessionProvider>
  );
};

export default trpc.withTRPC(App);
