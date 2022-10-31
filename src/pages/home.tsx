import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';

const Home: NextPage = () => {
  const { data } = useSession();
  console.log(data);

  return <div>Home</div>
}
;

export { getAuthedServerSideProps as getServerSideProps } from '../utils/session';

export default Home;
