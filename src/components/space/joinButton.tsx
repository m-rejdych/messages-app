import { type FC, type HTMLProps, useState } from 'react';

import JoinSpaceModal from './joinModal';

interface Props extends Omit<HTMLProps<HTMLButtonElement>, 'onClick' | 'type'> {
  onJoin?: () => void;
}

const JoinSpaceButton: FC<Props> = ({
  children,
  onJoin,
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        {...props}
        className={`btn btn-secondary${className ? ` ${className}` : ''}`}
        onClick={() => setOpen(true)}
      >
        {children ?? 'Join space'}
      </button>
      <JoinSpaceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default JoinSpaceButton;
