import type { AppProps } from 'next/app';

import { trpc } from '../utils/trpc';
import '../styles/globals.css';
import RootLayout from '../layout';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
};

export default trpc.withTRPC(App);
