import type { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Fade from '../fade';

interface Props {
  open: boolean;
  title?: string;
  children?: ReactNode;
}

const Modal: FC<Props> = ({ open, title, children }) =>
  typeof document !== 'undefined'
    ? createPortal(
        <Fade in={open} className={`modal${open ? ' modal-open' : ''}`}>
          <Fade scale in={open} className="modal-box">
            {title && <h3 className="fong-bold text-lg">{title}</h3>}
            {children}
          </Fade>
        </Fade>,
        document.body,
      )
    : null;

export default Modal;
