import type { FC, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import NavBar from './navBar';

interface Props {
  children: ReactNode;
}

const AppLayout: FC<Props> = ({ children }) => {
  const { data } = useSession();

  return (
    <div className="h-screen pt-16">
      {data && (
        <>
          {children}
          <NavBar />
        </>
      )}
    </div>
  );
};

export default AppLayout;
