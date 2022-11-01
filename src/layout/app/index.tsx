import type { FC, ReactNode } from 'react';

import NavBar from './navBar';

interface Props {
  children: ReactNode;
}

const AppLayout: FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen pt-16 bg-base-200">
      <NavBar />
      {children}
    </div>
  );
};

export default AppLayout;
