import { type FC, useState } from 'react';
import type { TRPCError } from '@trpc/server';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import Input from '../common/Input';
import Fade from '../common/Fade';
import {
  LOGIN_FIELDS,
  LOGIN_DEFAULTS,
  REGISTER_DEFAULTS,
  REGISTER_FIELDS,
} from '../../constants/auth/form';
import { trpc } from '../../utils/trpc';

type FieldValues = Record<
  keyof typeof LOGIN_DEFAULTS | keyof typeof REGISTER_DEFAULTS,
  string
>;

const AuthForm: FC = () => {
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const isRegistering = router.pathname.includes('/register');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: isRegistering ? REGISTER_DEFAULTS : LOGIN_DEFAULTS,
  });
  const registerMutation = trpc.auth.register.useMutation();

  const callbackUrl = router.query.callbackUrl ?? '/';

  const linkUrl = `/auth/${
    isRegistering ? 'login' : 'register'
  }?callbackUrl=${callbackUrl}`;

  const linkBaseText = isRegistering
    ? 'Already have an account?'
    : `Don't have an account?`;

  const handleSubmitForm: Parameters<typeof handleSubmit>[0] = async (
    values,
  ): Promise<void> => {
    if (registerMutation.isLoading) return;

    try {
      if (isRegistering) {
        await registerMutation.mutateAsync(values);
      }
    } catch (error) {
      setError((error as typeof registerMutation['error'])!.message);
      setShowError(true);
    }
  };

  return (
    <>
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          <div className="card-body">
            {(isRegistering ? REGISTER_FIELDS : LOGIN_FIELDS).map(
              ({ name, registerOptions, inputProps }) => (
                <Input
                  key={name}
                  error={errors[name]?.message}
                  {...inputProps}
                  {...register(name, registerOptions)}
                />
              ),
            )}
            <div className="form-control mt-6">
              <button
                className={`btn btn-primary${
                  registerMutation.isLoading ? ' loading' : ''
                }`}
                type="submit"
              >
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
      <Fade
        in={!!error && showError}
        className="alert alert-error shadow-lg fixed bottom-10 mx-auto w-auto"
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
        <div className="flex-none">
          <button
            className="btn btn-square btn-sm"
            onClick={() => setShowError(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Fade>
    </>
  );
};

export default AuthForm;
