import { type FC, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

const AuthLayout: FC<Props> = ({ children }) => {
  useEffect(() => {
    console.log('layout mount');
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center">
      {children}
    </div>
  );
};

export default AuthLayout;
