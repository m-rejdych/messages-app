import type { NextPage } from 'next';

import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const { data } = trpc.hello.useQuery({ name: 'Me' });

  if (!data) return null;

  return <div>{data}</div>;
};

export default Home;
