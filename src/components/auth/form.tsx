import type { FC } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import Input from '../common/Input';
import {
  LOGIN_FIELDS,
  LOGIN_DEFAULTS,
  REGISTER_DEFAULTS,
  REGISTER_FIELDS,
} from '../../constants/auth/form';

type FieldValues = Record<
  keyof typeof LOGIN_DEFAULTS | keyof typeof REGISTER_DEFAULTS,
  string
>;

const AuthForm: FC = () => {
  const router = useRouter();
  const isRegistering = router.pathname.includes('/register');
  const { register, handleSubmit } = useForm<FieldValues>({
    defaultValues: isRegistering ? REGISTER_DEFAULTS : LOGIN_DEFAULTS,
  });

  const callbackUrl = router.query.callbackUrl ?? '/';

  const linkUrl = `/auth/${
    isRegistering ? 'login' : 'register'
  }?callbackUrl=${callbackUrl}`;

  const linkBaseText = isRegistering
    ? 'Already have an account?'
    : `Don't have an account?`;

  const handleSubmitForm: Parameters<typeof handleSubmit>[0] = (
    values,
  ): void => {
    console.log(values);
  };

  return (
    <div className="card w-full max-w-sm shadow-2xl bg-base-100">
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <div className="card-body">
          {(isRegistering ? REGISTER_FIELDS : LOGIN_FIELDS).map(
            ({ name, registerOptions, inputProps }) => (
              <Input
                key={name}
                {...inputProps}
                {...register(name, registerOptions)}
              />
            ),
          )}
          <div className="form-control mt-6">
            <button className="btn btn-primary">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </div>
          <div className="form-control mt-3">
            <span className="label-text-alt">
              {linkBaseText}{' '}
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
