import { type FC, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import Input from '../common/input';
import Fade from '../common/fade';
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
  const [loading, setLoading] = useState(false);
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

  const callbackUrl = (router.query.callbackUrl as string) ?? '/app';

  const linkUrl = `/auth/${
    isRegistering ? 'login' : 'register'
  }?callbackUrl=${callbackUrl}`;

  const linkBaseText = isRegistering
    ? 'Already have an account?'
    : `Don't have an account?`;

  const handleSubmitForm: Parameters<typeof handleSubmit>[0] = async (
    values,
  ): Promise<void> => {
    if (registerMutation.isLoading || loading) return;
    setLoading(true);

    try {
      if (isRegistering) {
        await registerMutation.mutateAsync(values);
      }

      const { email, password } = values;

      const response = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!response?.ok) {
        setError(
          response?.status === 401
            ? 'Invalid email or password.'
            : 'Oops... Something went wrong.',
        );
        setShowError(true);
      } else {
        await router.push(callbackUrl);
      }

      setLoading(false);
    } catch (error: any) {
      setError(
        isRegistering
          ? (error as typeof registerMutation['error'])!.message
          : 'Invalid email or password.',
      );
      setShowError(true);
      setLoading(false);
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
                  registerMutation.isLoading || loading ? ' loading' : ''
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
        in={!!error && showError && !loading}
        scale
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
