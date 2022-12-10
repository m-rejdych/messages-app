import { type FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import useAuthError from '../../hooks/useAuthError';
import { trpc, type RouterOutputs } from '../../utils/trpc';
import type { MemberInfo } from '../../hooks/useSpaceSubscription';

type Space = RouterOutputs['space']['getById'];

interface Props extends Pick<Space, 'name' | 'members' | 'id'> {
  activeMembers: Record<string, MemberInfo>;
}

const Sidebar: FC<Props> = ({ id, name, members, activeMembers }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const getOrCreateDmMutation = trpc.chat.getOrCreateDmByMemberId.useMutation();
  const onError = useAuthError();

  if (!session?.user) return null;

  const handleSelectDm = async (memberId: number): Promise<void> => {
    try {
      const { id: chatId } = await getOrCreateDmMutation.mutateAsync({
        spaceId: id,
        memberId,
      });
      await router.push(`/app/${id}/${chatId}`);

      setSelectedId(memberId);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  return (
    <div className="w-1/3 md:w-1/4 pr-4">
      <h3 className="text-xl mb-4 font-bold">{name}</h3>
      <div className="divider" />
      <h4 className="text-lg font-bold mb-4">Channels</h4>
      <h4 className="text-lg font-bold mb-4">Direct messages</h4>
      <ul className="mb-4">
        {members
          .filter(({ user: { id } }) => id !== session.user.id)
          .map(({ id, user: { username } }) => (
            <li
              key={id}
              className={`[&:not(:last-child)]:mb-2 flex items-center cursor-pointer hover:bg-neutral px-2 py-1 rounded-md w-full text-left ${
                selectedId === id ? ' bg-neutral' : ''
              }`}
              role="button"
              onClick={() => handleSelectDm(id)}
            >
              <div
                className={`mr-3 avatar placeholder${
                  id in activeMembers ? ' online' : ''
                }`}
              >
                <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                  {username[0].toUpperCase()}
                </div>
              </div>
              {username}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
