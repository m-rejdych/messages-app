import { type FC, useState } from 'react';

import Modal from '../common/modal/modal';
import CreateSpaceForm from './createForm';

const CreateSpaceButton: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Create space
      </button>
      <Modal open={open} title="Create space">
        <CreateSpaceForm onSubmit={() => setOpen(false)} withModalActions />
      </Modal>
    </>
  );
};

export default CreateSpaceButton;
