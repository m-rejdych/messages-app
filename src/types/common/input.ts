import type { HTMLProps, DetailedHTMLProps, InputHTMLAttributes } from 'react';

export interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  error?: string;
  formControlProps?: HTMLProps<HTMLDivElement>;
  helperText?: {
    href?: string;
    text: string;
  };
}
