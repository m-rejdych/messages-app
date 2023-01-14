import { type FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import Modal from '../common/modal';
import Input from '../common/input';
import SpacesList from './list';
import ErrorMessage from '../common/errorMessage';
import useDebounce from '../../hooks/useDebounce';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import type { Action } from '../common/cardsList';

interface Props {
  open: boolean;
  onClose?: () => void;
}

const JoinSpaceModal: FC<Props> = ({ open, onClose }) => {
  const onError = useAuthError();
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useDebounce(value, 1000);
  const { data: session } = useSession();
  const { data, isFetched, isRefetching } =
    trpc.space.findPublicByName.useQuery(debouncedValue.trim(), {
      enabled: !!debouncedValue.trim(),
      keepPreviousData: true,
      onError,
    });
  const joinMutation = trpc.space.join.useMutation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleJoin = async (id: number): Promise<void> => {
    try {
      await joinMutation.mutateAsync(id);
      await router.push(`/app/${id}`);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const getAction = (id: number): Action | undefined => {
    if (!session) return undefined;

    const space = data?.find((space) => space.id === id);
    if (!space) return undefined;

    if (space.members.some(({ userId }) => userId === session.user.id)) {
      return {
        text: 'You are a member',
        inactive: true,
      };
    }

    return {
      text: 'Join!',
      onAction: handleJoin,
      loading: joinMutation.isLoading,
    };
  };

  const handleExited = (): void => {
    setValue('');
    setDebouncedValue('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={handleExited}
      title="Join space"
      boxProps={{ className: 'overflow-hidden flex flex-col' }}
    >
      <Input onChange={handleChange} label="Space name" placeholder="name" />
      <div className="divider" />
      <h2 className="text-lg font-bold">Spaces</h2>
      {debouncedValue && data?.length ? (
        <SpacesList
          action={getAction}
          spaces={data}
          className="overflow-auto"
        />
      ) : (
        <ErrorMessage>
          {isFetched || isRefetching
            ? 'No spaces found'
            : 'Start typing to look for spaces'}
        </ErrorMessage>
      )}
    </Modal>
  );
};

export default JoinSpaceModal;
