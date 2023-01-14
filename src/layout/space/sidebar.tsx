import type { FC } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import useAuthError from '../../hooks/useAuthError';
import CreateChannelButton from '../../components/chat/createChannelButton';
import ChatsList, { type ListItem } from '../../components/chat/list';
import FindChannelButton from '../../components/chat/findChannelButton';
import FindDmButton from '../../components/chat/findDmButton';
import { trpc, type RouterOutputs } from '../../utils/trpc';
import type { MemberInfo } from '../../hooks/useSpaceSubscription';

type Dm = RouterOutputs['chat']['getDms'] extends Array<infer T> ? T : never;
type Channel = RouterOutputs['chat']['getChannels'] extends Array<infer T>
  ? T
  : never;

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
  const { data: channels } = trpc.chat.getChannels.useQuery(
    { spaceId },
    { onError },
  );

  if (!session) return null;

  const formatToDmsListItem = ({ id, members }: Dm): ListItem => {
    const otherMember = members.find(
      ({
        member: {
          user: { id: userId },
        },
      }) => userId !== session.user.id,
    );

    if (!otherMember) {
      return {
        id,
        text: '',
        isOnline: false,
        selected: false,
      };
    }

    const {
      member: {
        id: memberId,
        user: { username },
      },
    } = otherMember;

    return {
      id,
      text: username,
      isOnline: memberId in activeMembers,
      selected: id === currentChatId,
    };
  };

  const formatToChannelsListItem = ({ id, name }: Channel): ListItem => ({
    id,
    text: name ?? '',
    selected: id === currentChatId,
  });

  return (
    <div className="w-1/3 md:w-1/4 h-full flex flex-col pr-4">
      <h3 className="text-xl mb-4 font-bold">{spaceName}</h3>
      <div className="divider" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold">Channels</h4>
          <div className="flex items-center">
            <FindChannelButton className="mr-3" />
            <CreateChannelButton />
          </div>
        </div>
        {channels?.length ? (
          <ChatsList
            spaceId={spaceId}
            items={channels.map(formatToChannelsListItem)}
            className="overflow-auto"
          />
        ) : (
          <div className="flex-1 grid place-items-center">
            <p className="font-semibold text-secondary">No channels</p>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold">Direct messages</h4>
          <FindDmButton />
        </div>
        {dms?.length ? (
          <ChatsList
            spaceId={spaceId}
            items={dms.map(formatToDmsListItem)}
            className="overflow-auto"
          />
        ) : (
          <div className="flex-1 grid place-items-center">
            <p className="font-semibold text-secondary">No dms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
