import type { NextPage } from 'next';

import AuthForm from '../components/auth/form';

const Login: NextPage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center">
      <AuthForm card />
    </div>
  );
};

export default Login;
