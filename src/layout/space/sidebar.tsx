import type { FC } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import useAuthError from '../../hooks/useAuthError';
import { trpc, type RouterOutputs } from '../../utils/trpc';

type Space = RouterOutputs['space']['getById'];

const Sidebar: FC<Pick<Space, 'name' | 'members' | 'id'>> = ({
  id,
  name,
  members,
}) => {
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
      await router.push(`/app/space/${id}/dm/${chatId}`);
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
      <ul className="mb-4 ml-2">
        {members
          .filter(({ user: { id } }) => id !== session.user.id)
          .map(({ id, user: { username } }) => (
            <li key={id} className="[&:not(:last-child)]:mb-2">
              <button
                className="btn btn-ghost"
                onClick={() => handleSelectDm(id)}
              >
                {username}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
