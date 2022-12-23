import { type FC, useState } from 'react';
import { MdAdd } from 'react-icons/md';

import CreateChannelModal from './createChannelModal';

const CreateChannelButton: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn btn-square btn-sm"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MdAdd className="text-2xl" />
      </button>
      <CreateChannelModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default CreateChannelButton;
