import { type FC, type HTMLProps, useState } from 'react';
import { MdSearch } from 'react-icons/md';

import FindDmModal from './findDmModal';

type Props = Omit<HTMLProps<HTMLButtonElement>, 'type'>;

const FindDmButton: FC<Props> = ({ onClick, className, ...rest }) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    setOpen((prev) => !prev);
    if (onClick) onClick(e);
  };

  return (
    <>
      <button
        {...rest}
        onClick={handleClick}
        className={`btn btn-square btn-sm${className ? ` ${className}` : ''}`}
      >
        <MdSearch className="text-2xl" />
      </button>
      <FindDmModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default FindDmButton;
