import { type FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import Modal from '../common/modal';
import Input from '../common/input';
import CardsList from '../common/cardsList';
import useDebounce from '../../hooks/useDebounce';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import type { Action } from '../common/cardsList';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FindChannelModal: FC<Props> = (props) => {
  const router = useRouter();
  const spaceId = parseInt(router.query.spaceId as string, 10);
  const onError = useAuthError();
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useDebounce(value, 1000);
  const { data: session } = useSession();
  const { data, isFetched, isRefetching } =
    trpc.chat.findPublicChannelByName.useQuery(
      {
        name: debouncedValue,
        spaceId,
      },
      {
        enabled: !!debouncedValue,
        keepPreviousData: true,
        onError,
      },
    );

  const handleExited = (): void => {
    setValue('');
    setDebouncedValue('');
  };

  const getAction = (id: number): Action | undefined => {
    if (!session?.user.id) return undefined;

    const channel = data?.find((channel) => channel.id === id);
    if (!channel) return undefined;

    if (
      channel.members.some(
        ({ member: { userId } }) => userId === session.user.id,
      )
    ) {
      return {
        text: 'Go',
        navigate: {
          prefix: `/app/${spaceId}/`,
        },
      };
    }

    return {
      text: 'Join',
      onAction: async (id: number) => {
        // join mutation
        await router.push(`/app/${spaceId}/${id}`);
      },
    };
  };

  return (
    <Modal {...props} title="Find channel" onExited={handleExited}>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="divider" />
      <h2 className="text-lg font-bold">Channels</h2>
      {debouncedValue && data?.length ? (
        <CardsList
          className="mt-3"
          action={getAction}
          items={data.map(({ id, name }) => ({
            id,
            label: name ?? 'Unnamed channel',
          }))}
        />
      ) : (
        <div className="h-32 flex flex-auto items-center justify-center">
          <h3 className="text-lg">
            {isFetched || isRefetching
              ? 'No spaces found'
              : 'Start typing to look for spaces'}
          </h3>
        </div>
      )}
    </Modal>
  );
};

export default FindChannelModal;
