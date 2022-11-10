import { type FC, type HTMLProps, useState } from 'react';

import Modal from '../common/modal/modal';
import CreateSpaceForm from './createForm';

interface Props extends Omit<HTMLProps<HTMLButtonElement>, 'type' | 'onClick'> {
  onCreate?: () => void;
}

const CreateSpaceButton: FC<Props> = ({
  className,
  children,
  onCreate,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (): void => {
    onCreate?.();
    setOpen(false);
  };

  return (
    <>
      <button
        {...props}
        className={`btn btn-primary${(className = ` ${className} : ''`)}`}
        onClick={() => setOpen(true)}
      >
        {children ?? 'Create space'}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create space">
        <CreateSpaceForm onSubmit={handleSubmit} withModalActions />
      </Modal>
    </>
  );
};

export default CreateSpaceButton;
