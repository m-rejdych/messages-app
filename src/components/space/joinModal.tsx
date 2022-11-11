import { type FC, useState } from 'react';
import { useRouter } from 'next/router';

import Modal from '../common/modal';
import Input from '../common/input';
import SpacesList from './list';
import useDebounce from '../../hooks/useDebounce';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';

interface Props {
  open: boolean;
  onClose?: () => void;
}

const JoinSpaceModal: FC<Props> = ({ open, onClose }) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 1000);
  const { data, isFetched, isRefetching } =
    trpc.space.searchPublicByName.useQuery(debouncedValue, {
      enabled: !!debouncedValue,
      keepPreviousData: true,
    });
  const onError = useAuthError();
  const joinMutation = trpc.space.join.useMutation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleJoin = async (id: number): Promise<void> => {
    try {
      await joinMutation.mutateAsync(id);
      await router.push(`/app/space/${id}`);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join space"
      boxProps={{ className: 'overflow-hidden flex flex-col' }}
    >
      <Input onChange={handleChange} label="Space name" placeholder="name" />
      <div className="divider" />
      <h2 className="text-md font-bold">Spaces</h2>
      {data && debouncedValue && data.length ? (
        <SpacesList
          action={{
            text: 'Join!',
            onAction: handleJoin,
            loading: joinMutation.isLoading,
          }}
          spaces={data}
          className="overflow-auto"
        />
      ) : (
        <div className="h-32 flex flex-auto items-center justify-center">
          <h3 className="text-md">
            {isFetched || isRefetching
              ? 'No spaces found'
              : 'Start typing to look for spaces'}
          </h3>
        </div>
      )}
    </Modal>
  );
};

export default JoinSpaceModal;
