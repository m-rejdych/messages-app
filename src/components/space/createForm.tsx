import { FC } from 'react';
import { useForm } from 'react-hook-form';

import ModalActions from '../common/modal/modalActions';
import Input from '../common/input';
import Checkbox from '../common/checkbox';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import { DEFAULTS, FIELDS } from '../../constants/space/form';

type FieldValues = {
  [P in keyof typeof DEFAULTS]: typeof DEFAULTS[P];
}

interface Props {
  withModalActions?: boolean;
  onSubmit?: () => void;
}

const CreateSpaceForm: FC<Props> = ({ onSubmit, withModalActions }) => {
  const createSpace = trpc.space.create.useMutation();
  const { handleSubmit, register, formState } = useForm({
    defaultValues: DEFAULTS,
  });
  const onError = useAuthError();

  const handleSubmitForm = async (values: FieldValues): Promise<void> => {
    try {
      await createSpace.mutateAsync(values);
      onSubmit?.();
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const submitButton = (
    <button
      className={`btn btn-primary${createSpace.isLoading ? ' loading' : ''}`}
      type="submit"
    >
      Submit
    </button>
  );

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitForm)}>
      {FIELDS.map(({ name, inputProps, registerOptions }) =>
        typeof DEFAULTS[name] === 'string' ? (
          <Input
            key={name}
            error={formState.errors.name?.message}
            {...inputProps}
            {...register(name, registerOptions)}
          />
        ) : (
          <Checkbox
            key={name}
            className="checkbox-secondary"
            formControlProps={{
              className: 'mt-2',
            }}
            {...inputProps}
            {...register(name, registerOptions)}
          />
        ),
      )}
      {withModalActions ? (
        <ModalActions>{submitButton}</ModalActions>
      ) : (
        submitButton
      )}
    </form>
  );
};

export default CreateSpaceForm;
