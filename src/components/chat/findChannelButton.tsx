import { type FC, type HTMLProps, useState } from 'react';
import { MdSearch } from 'react-icons/md';

import FindChannelModal from './findChannelModal';

type Props = Omit<HTMLProps<HTMLButtonElement>, 'type'>;

const FindChannelButton: FC<Props> = ({ className, onClick, ...rest }) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    setOpen((prev) => !prev);
    if (onClick) onClick(e);
  };

  return (
    <>
      <button
        {...rest}
        className={`btn btn-square btn-sm${className ? ` ${className}` : ''}`}
        onClick={handleClick}
      >
        <MdSearch className="text-2xl" />
      </button>
      <FindChannelModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default FindChannelButton;
