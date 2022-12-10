import { useEffect, useState } from 'react';
import Pusher, { type Members, type PresenceChannel } from 'pusher-js';

export interface MemberInfo {
  name: string;
  email: string;
}

interface Member {
  id: string;
  info: MemberInfo;
}

type UseSpaceSubscription = (spaceId: number) => {
  members: Record<string, MemberInfo>;
};

const useSpaceSubscription: UseSpaceSubscription = (spaceId: number) => {
  const [members, setMembers] = useState<Record<string, MemberInfo>>({});

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      forceTLS: true,
      channelAuthorization: {
        endpoint: process.env
          .NEXT_PUBLIC_PUSHER_AUTHORIZATION_ENDPOINT as string,
        transport: 'ajax',
      },
    });

    const spaceChannel = pusher.subscribe(
      `presence-sp-${spaceId}`,
    ) as PresenceChannel;

    spaceChannel.bind('pusher:subscription_succeeded', (data: Members) => {
      setMembers(data.members);
    });

    spaceChannel.bind('pusher:member_added', ({ id, info }: Member) => {
      setMembers((prev) => ({ ...prev, [id]: info }));
    });

    spaceChannel.bind('pusher:member_removed', ({ id }: Member) => {
      setMembers((prev) => {
        const temp = { ...prev };
        delete temp[id];
        return temp;
      });
    });

    return () => {
      pusher.unbind_all();
      pusher.disconnect();
      setMembers({});
    };
  }, [spaceId]);

  return { members };
};

export default useSpaceSubscription;
