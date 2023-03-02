import { type FC, type HTMLProps, useState } from 'react';
import { MdAdd } from 'react-icons/md';

import CreateChannelModal from './createChannelModal';

type Props = Omit<HTMLProps<HTMLButtonElement>, 'type'>;

const CreateChannelButton: FC<Props> = ({ className, onClick, ...rest }) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    setOpen((prev) => !prev);
    if (onClick) onClick(e);
  };

  return (
    <>
      <button
        {...rest}
        className={`btn btn-square btn-sm${
          className ? ` ${className}` : ''
        }`}
        onClick={handleClick}
      >
        <MdAdd className="text-2xl" />
      </button>
      <CreateChannelModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default CreateChannelButton;
