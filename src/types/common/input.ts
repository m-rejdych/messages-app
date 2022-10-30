import type { HTMLProps } from 'react';

export interface InputProps extends HTMLProps<HTMLInputElement> {
  label?: string;
  helperText?: {
    href?: string;
    text: string;
  };
}
