import type { NextPage } from 'next';

import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const { data } = trpc.hello.useQuery({ name: 'Me' });

  if (!data) return null;

  return <h1 className="bg-red-100">{data}</h1>;
};

export default Home;
