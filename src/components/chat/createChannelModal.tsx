import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

import Modal from '../common/modal';
import Input from '../common/input';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import type { Field } from '../../types/form';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DEFAULTS = { name: '' };

const FIELD: Field<keyof typeof DEFAULTS> = {
  name: 'name',
  inputProps: {
    placeholder: 'channel name',
    label: 'Name',
  },
  registerOptions: {
    setValueAs: (value: string) => value.trim(),
    required: {
      value: true,
      message: 'Channel name is required.',
    },
    minLength: {
      value: 2,
      message: 'Channel name have to be at least 2 characters long.',
    },
  },
} as const;

const CreateChannelModal: FC<Props> = ({ onClose, ...rest }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULTS });
  const router = useRouter();
  const onError = useAuthError();
  const createChannelMutation = trpc.chat.createChannel.useMutation();

  const handleSubmitForm: Parameters<typeof handleSubmit>[0] = async (
    fields,
  ): Promise<void> => {
    try {
      await createChannelMutation.mutateAsync({
        ...fields,
        spaceId: parseInt(router.query.spaceId as string, 10),
      });
      onClose();
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  return (
    <Modal {...rest} onClose={onClose} onExited={reset} title="Create channel">
      <form noValidate onSubmit={handleSubmit(handleSubmitForm)}>
        <Input
          error={errors[FIELD.name]?.message}
          {...FIELD.inputProps}
          {...register(FIELD.name, FIELD.registerOptions)}
        />
        <button className="btn btn-primary mt-6" type="submit">
          Create
        </button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
