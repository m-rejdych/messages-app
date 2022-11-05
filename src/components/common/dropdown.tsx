import type { ReactNode } from 'react';

import Fade from './fade';
import type { Item } from '../../types/common/dropdown';

interface Props<T> {
  children?: ReactNode;
  items: Item<T>[];
  onItemClick: (value: T) => void | Promise<void>;
  open: boolean;
}

const Dropdown = <T extends unknown>({
  children,
  items,
  onItemClick,
  open,
}: Props<T>) => (
  <div className="dropdown dropdown-open">
    {children}
    <Fade scale in={open}>
      <ul
        tabIndex={0}
        className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
      >
        {items.map(({ value, label }) => (
          <li key={`dropdown-item-${value}`}>
            {<button onClick={() => onItemClick(value)}>{label}</button>}
          </li>
        ))}
      </ul>
    </Fade>
  </div>
);

export default Dropdown;
