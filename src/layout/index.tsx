import type { FC } from 'react';

interface Props {
  children: React.ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => (
  <div className="bg-base-200 min-h-screen transition-colors">
    <div className="container mx-auto">{children}</div>
  </div>
);

export default RootLayout;
