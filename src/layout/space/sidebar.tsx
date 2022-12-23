import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import useAuthError from '../../hooks/useAuthError';
import CreateChannelButton from '../../components/chat/createChannelButton';
import { trpc, type RouterOutputs } from '../../utils/trpc';
import type { MemberInfo } from '../../hooks/useSpaceSubscription';

type Chat = RouterOutputs['chat']['getDms'] extends Array<infer R> ? R : never;

interface Props {
  spaceName: string;
  activeMembers: Record<string, MemberInfo>;
}

const Sidebar: FC<Props> = ({ spaceName, activeMembers }) => {
  const router = useRouter();
  const spaceId = parseInt(router.query.spaceId as string, 10);
  const currentChatId =
    router.query.chatId && parseInt(router.query.chatId as string, 10);
  const onError = useAuthError();
  const { data: session } = useSession();
  const { data: dms } = trpc.chat.getDms.useQuery(
    {
      spaceId,
    },
    { onError },
  );

  if (!session?.user) return null;

  const renderListItem = ({ id, members }: Chat): React.ReactNode => {
    const otherMember = members.find(
      ({
        member: {
          user: { id: userId },
        },
      }) => userId !== session.user.id,
    );

    if (!otherMember) return null;

    const {
      member: {
        id: memberId,
        user: { username },
      },
    } = otherMember;

    return (
      <li
        key={id}
        className={`[&:not(:last-child)]:mb-2 px-2 py-1 rounded-md w-full text-left hover:bg-neutral${
          id === currentChatId ? ' bg-neutral' : ''
        }`}
      >
        <Link
          href={`/app/${spaceId}/${id}`}
          className="flex items-center cursor-pointer w-full"
        >
          <div
            className={`mr-3 avatar placeholder${
              memberId in activeMembers ? ' online' : ''
            }`}
          >
            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
              {username[0].toUpperCase()}
            </div>
          </div>
          {username}
        </Link>
      </li>
    );
  };

  return (
    <div className="w-1/3 md:w-1/4 h-full flex flex-col pr-4">
      <h3 className="text-xl mb-4 font-bold">{spaceName}</h3>
      <div className="divider" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between md-4">
          <h4 className="text-lg font-bold">Channels</h4>
          <CreateChannelButton />
        </div>
        {/* <ul className="flex-1 overflow-auto" /> */}
        <div className="flex-1 grid place-items-center">
          <p className="font-semibold text-secondary">No channels</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <h4 className="text-lg font-bold mb-4">Direct messages</h4>
        {dms && dms.length ? (
          <ul className="flex-1 overflow-auto">{dms.map(renderListItem)}</ul>
        ) : (
          <div className="flex-1 grid place-items-center">
            <p className="font-semibold text-secondary">No channels</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
