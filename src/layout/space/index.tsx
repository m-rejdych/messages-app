import { type FC, useEffect } from 'react';
import { useRouter } from 'next/router';
import Pusher from 'pusher-js';
import HashLoader from 'react-spinners/HashLoader';

import useAuthError from '../../hooks/useAuthError';
import Sidebar from './sidebar';
import { trpc } from '../../utils/trpc';

interface UserData {
  user_data: string;
}

interface Props {
  children: React.ReactNode;
}

const SpaceLayout: FC<Props> = ({ children }) => {
  const { query } = useRouter();
  const onError = useAuthError();
  const spaceId = parseInt(query.spaceId as string, 10);
  const { data, isInitialLoading, error } = trpc.space.getById.useQuery(
    { spaceId },
    { onError, retry: false, refetchOnWindowFocus: false },
  );

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      forceTLS: true,
      userAuthentication: {
        endpoint: process.env.NEXT_PUBLIC_PUSHER_AUTH_ENDPOINT as string,
        transport: 'ajax',
        params: {
          spaceId,
        },
      },
    });
    pusher.signin();

    pusher.bind('pusher:signin_success', (data: UserData) => {
      console.log(JSON.parse(data.user_data));
    });
    pusher.bind('pusher:error', (data: unknown) => {
      console.log(data);
    });

    return () => {
      pusher.unbind_all();
      pusher.disconnect();
    };
  }, []);

  if (isInitialLoading) {
    return (
      <div className="h-full grid place-items-center">
        <HashLoader size={150} color="#3abff8" loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full grid place-items-center">
        <h1 className="text-4xl">
          {error.shape?.data.httpStatus === 404
            ? 'Space not found'
            : error.message}
        </h1>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex items-start h-full py-8">
      <Sidebar id={spaceId} name={data.name} members={data.members} />
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
};

export default SpaceLayout;
