import AuthLayout from '../../layout/auth';
import AuthForm from '../../components/auth/form';
import type { NextPageWithLayout } from '../../types/page';

const Login: NextPageWithLayout = () => {
  return <AuthForm />;
};

Login.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export { getUnauthedServerSideProps as getServerSideProps } from '../../utils/session';

export default Login;
