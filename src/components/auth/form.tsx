import type { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Input from '../common/Input';

const AuthForm: FC = () => {
  const router = useRouter();

  const isRegistering = router.pathname.includes('/register');

  const callbackUrl = router.query.callbackUrl ?? '/';

  const linkUrl = `/auth/${
    isRegistering ? 'login' : 'register'
  }?callbackUrl=${callbackUrl}`;

  return (
    <div className="card w-full max-w-sm shadow-2xl bg-base-100">
      <form>
        <div className="card-body">
          <Input label="Email" placeholder="email" type="email" />
          <Input
            label="Password"
            placeholder="password"
            type="password"
            helperText={{ text: 'Forgot password?' }}
          />
          <div className="form-control mt-6">
            <button className="btn btn-primary">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </div>
          <div className="form-control mt-3">
            <span className="label-text-alt">
              {isRegistering
                ? 'Already have an account?'
                : `Don't have an account?`}{' '}
              <Link href={linkUrl} className="text-accent link link-hover">
                {isRegistering ? 'Login' : 'Register'}
              </Link>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
