import type { FC, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

const ModalActions: FC<Props> = ({ children }) => (
  <div className="modal-action">{children}</div>
);

export default ModalActions;
