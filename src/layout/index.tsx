import type { FC } from 'react';

interface Props {
  children: React.ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => (
  <div className="container mx-auto">{children}</div>
);

export default RootLayout;
