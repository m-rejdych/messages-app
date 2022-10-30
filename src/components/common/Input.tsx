import type { FC, HTMLProps } from 'react';
import Link from 'next/link';
import classNames from 'classnames';

interface Props extends HTMLProps<HTMLInputElement> {
  label?: string;
  helperText?: {
    href?: string;
    text: string;
  };
}

const Input: FC<Props> = ({ label, className, helperText, ...rest }) => (
  <div className="form-control">
    {label && (
      <label className="label" htmlFor={rest.name ?? undefined}>
        <span className="label-text">{label}</span>
      </label>
    )}
    <input
      {...rest}
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
);

export default Input;
