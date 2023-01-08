import { type FC, useState } from 'react';

import Modal from '../common/modal';
import Input from '../common/input';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FindChannelModal: FC<Props> = (props) => {
  const [value, setValue] = useState('');

  return (
    <Modal {...props} title="Find channel">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
    </Modal>
  );
};

export default FindChannelModal;
