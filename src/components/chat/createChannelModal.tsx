import type { FC } from 'react';
import { useForm } from 'react-hook-form';

import Modal from '../common/modal';
import Input from '../common/input';
import type { Field } from '../../types/form';

interface Props {
  open: boolean;
  onClose: () => void;
}

const DEFAULTS = { name: '' } as const;

const FIELD: Field<keyof typeof DEFAULTS> = {
  name: 'name',
  inputProps: {
    placeholder: 'channel name',
    label: 'Name',
  },
  registerOptions: {
    required: {
      value: true,
      message: 'Channel name is required.',
    },
    minLength: {
      value: 2,
      message: 'Channel name have to be at least 2 characters long.',
    },
  },
};

const CreateChannelModal: FC<Props> = (props) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULTS });

  return (
    <Modal {...props} onExited={reset} title="Create channel">
      <form noValidate onSubmit={handleSubmit(() => {})}>
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
