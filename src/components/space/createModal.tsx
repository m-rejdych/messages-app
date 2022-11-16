import { type FC } from 'react';

import Modal from '../common/modal';
import CreateSpaceForm from './createForm';

interface Props {
  open: boolean;
  onClose?: () => void;
  onCreate?: () => void;
}

const CreateSpaceModal: FC<Props> = ({ onCreate, onClose, open }) => {
  const handleSubmit = (): void => {
    onCreate?.();
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create space">
      <CreateSpaceForm onSubmit={handleSubmit} withModalActions />
    </Modal>
  );
};

export default CreateSpaceModal;
