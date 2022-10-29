import type { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="text"
              placeholder="email"
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="text"
              placeholder="password"
              className="input input-bordered"
            />
            <label className="label">
              <a className="label-text-alt link link-hover">Forgot password?</a>
            </label>
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-primary">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </div>
          <span className="label-text-alt mt-3">
            {isRegistering
              ? 'Already have an account?'
              : `Don't have an account?`}{' '}
            <Link href={linkUrl} className="text-accent link link-hover">
              {isRegistering ? 'Login' : 'Register'}
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
