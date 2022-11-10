import { type HTMLProps, forwardRef } from 'react';

interface Props extends HTMLProps<HTMLInputElement> {
  formControlProps?: HTMLProps<HTMLDivElement>;
  label?: string;
}

// eslint-disable-next-line react/display-name
const Checkbox = forwardRef<HTMLInputElement, Props>(
  ({ className, label, formControlProps, ...props }, ref) => (
    <div
      {...formControlProps}
      className={`form-control${
        formControlProps?.className ? ` ${formControlProps.className}` : ''
      }`}
    >
      <label className="label cursor-pointer">
        {label && <span className="label-text">{label}</span>}
        <input
          {...props}
          ref={ref}
          type="checkbox"
          className={`checkbox${className ? ` ${className}` : ''}`}
        />
      </label>
    </div>
  ),
);

export default Checkbox;
