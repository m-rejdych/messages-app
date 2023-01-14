import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const ErrorMessage: FC<Props> = ({ children }) => (
  <div className="h-32 flex flex-auto items-center justify-center">
    <h3 className="text-lg">{children}</h3>
  </div>
);

export default ErrorMessage;
