import { type FC, useState } from 'react';
import { useRouter } from 'next/router';

import Modal from '../common/modal';
import Input from '../common/input';
import ErrorMessage from '../common/errorMessage';
import CardsList from '../common/cardsList';
import useDebounce from '../../hooks/useDebounce';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FindDmModal: FC<Props> = ({ onClose, ...rest }) => {
  const router = useRouter();
  const spaceId = parseInt(router.query.spaceId as string, 10);
  const onError = useAuthError();
  const utils = trpc.useContext();
  const getOrCreateDmByMemberIdMutation =
    trpc.chat.getOrCreateDmByMemberId.useMutation();
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useDebounce(value, 1000);
  const { data, isFetched, isRefetching } =
    trpc.membership.findByUsername.useQuery(
      { spaceId, username: debouncedValue.trim() },
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

  const handleAction = async (id: number): Promise<void> => {
    try {
      const { id: chatId } = await getOrCreateDmByMemberIdMutation.mutateAsync({
        spaceId,
        memberId: id,
      });
      await utils.chat.getDms.invalidate({ spaceId });
      await router.push(`/app/${spaceId}/${chatId}`);
      onClose();
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  return (
    <Modal
      {...rest}
      title="Find space member"
      onClose={onClose}
      onExited={handleExited}
    >
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="divider" />
      <h2 className="text-lg font-bold">Direct messages</h2>
      {debouncedValue && data?.length ? (
        <CardsList
          className="mt-3"
          items={data.map(({ id, user: { username } }) => ({
            id,
            label: username,
          }))}
          action={{
            text: 'Go',
            onAction: handleAction,
          }}
        />
      ) : (
        <ErrorMessage>
          {isFetched || isRefetching
            ? 'No kembers found'
            : 'Start typing to look for space members'}
        </ErrorMessage>
      )}
    </Modal>
  );
};

export default FindDmModal;
