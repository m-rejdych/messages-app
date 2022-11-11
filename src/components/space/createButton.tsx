import { type FC, type HTMLProps, useState } from 'react';

import CreateSpaceModal from './createModal';

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

  const handleClose = (): void => {
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
      <CreateSpaceModal
        open={open}
        onClose={handleClose}
        onCreate={handleClose}
      />
    </>
  );
};

export default CreateSpaceButton;
