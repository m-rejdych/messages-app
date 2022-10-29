import type { NextPage } from 'next';

import AuthLayout from '../../layout/auth';
import AuthForm from '../../components/auth/form';

const Login: NextPage = () => {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  );
};

export default Login;
