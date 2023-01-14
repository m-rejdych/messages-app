import { type FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import Modal from '../common/modal';
import Input from '../common/input';
import CardsList from '../common/cardsList';
import ErrorMessage from '../common/errorMessage';
import useDebounce from '../../hooks/useDebounce';
import useAuthError from '../../hooks/useAuthError';
import { trpc, type RouterOutputs } from '../../utils/trpc';
import type { Action } from '../common/cardsList';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Channel = RouterOutputs['chat']['findPublicChannelByName'] extends Array<
  infer T
>
  ? T
  : never;

const FindChannelModal: FC<Props> = ({ onClose, ...rest }) => {
  const router = useRouter();
  const spaceId = parseInt(router.query.spaceId as string, 10);
  const onError = useAuthError();
  const joinPublicChannelMutation = trpc.chat.joinPublicChannel.useMutation();
  const utils = trpc.useContext();
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useDebounce(value, 1000);
  const { data: session } = useSession();
  const { data, isFetched, isRefetching } =
    trpc.chat.findPublicChannelByName.useQuery(
      {
        name: debouncedValue.trim(),
        spaceId,
      },
      {
        enabled: !!debouncedValue.trim(),
        keepPreviousData: true,
        onError,
      },
    );

  const handleExited = (): void => {
    setValue('');
    setDebouncedValue('');
  };

  const getChannel = (channelId: number): Channel | undefined => {
    if (!data) return undefined;

    return data.find(({ id }) => id === channelId);
  };

  const isChannelMember = (channel: Channel): boolean =>
    channel.members.some(
      ({ member: { userId } }) => userId === session?.user.id,
    );

  const getAction = (id: number): Action | undefined => {
    if (!session) return undefined;

    const channel = getChannel(id);
    if (!channel) return undefined;

    if (isChannelMember(channel)) {
      return {
        text: 'Go',
        onAction: onClose,
        navigate: {
          prefix: `/app/${spaceId}/`,
        },
      };
    }

    return {
      text: 'Join',
      loading: joinPublicChannelMutation.isLoading,
      onAction: async (id: number) => {
        try {
          await joinPublicChannelMutation.mutateAsync({
            spaceId,
            channelId: id,
          });
          await utils.chat.getChannels.invalidate({ spaceId });
          await router.push(`/app/${spaceId}/${id}`);
          onClose();
        } catch (error) {
          onError(error as Parameters<typeof onError>[0]);
        }
      },
    };
  };

  const getSublabel = (id: number): string => {
    const channel = getChannel(id);
    if (!channel) return '';

    return isChannelMember(channel) ? 'You are a member' : '';
  };

  return (
    <Modal
      {...rest}
      title="Find channel"
      onClose={onClose}
      onExited={handleExited}
    >
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
            sublabel: getSublabel(id),
          }))}
        />
      ) : (
        <ErrorMessage>
          {isFetched || isRefetching
            ? 'No channels found'
            : 'Start typing to look for channels'}
        </ErrorMessage>
      )}
    </Modal>
  );
};

export default FindChannelModal;
