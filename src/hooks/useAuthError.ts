import { useRouter } from 'next/router';
import type { TRPCClientErrorLike } from '@trpc/client';

import type { AppRouter } from '../server/routers/_app';

type ErrorHandler = (error: TRPCClientErrorLike<AppRouter>) => void;

const useAuthError = (): ErrorHandler => {
  const router = useRouter();

  const onError = (error: TRPCClientErrorLike<AppRouter>): void => {
    if (error.data?.httpStatus === 401) {
      router.push(`/auth/login?callbackUrl=${router.asPath}`);
    }
  };

  return onError;
};

export default useAuthError;
