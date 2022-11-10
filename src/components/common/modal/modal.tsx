import type { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Fade from '../fade';

interface Props {
  open: boolean;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
}

const Modal: FC<Props> = ({ open, title, onClose, children }) =>
  typeof document !== 'undefined'
    ? createPortal(
        <Fade in={open} className={`modal${open ? ' modal-open' : ''}`}>
          <Fade scale in={open} className="modal-box">
            {title && <h3 className="fong-bold text-lg">{title}</h3>}
            {onClose && (
              <button
                className="btn btn-square btn-sm absolute top-4 right-4"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {children}
          </Fade>
        </Fade>,
        document.body,
      )
    : null;

export default Modal;
