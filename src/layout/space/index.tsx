import type { FC } from 'react';

interface Props {
  children: React.ReactNode;
}

const SpaceLayout: FC<Props> = ({ children }) => <div>{children}</div>;

export default SpaceLayout;
