import { type FC, forwardRef } from 'react';
import Link from 'next/link';
import classNames from 'classnames';

import type { InputProps } from '../../types/common/input';

// eslint-disable-next-line react/display-name
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, helperText, ...rest }, ref) => (
    <div className="form-control">
      {label && (
        <label className="label" htmlFor={rest.name ?? undefined}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        {...rest}
        ref={ref}
        className={classNames('input input-bordered', className)}
      />
      {helperText && (
        <label className="label">
          {helperText.href ? (
            <Link
              href={helperText.href}
              className="label-text-alt link link-hover"
            >
              {helperText.text}
            </Link>
          ) : (
            <span className="label-text-alt">{helperText.text}</span>
          )}
        </label>
      )}
    </div>
  ),
);

export default Input;
