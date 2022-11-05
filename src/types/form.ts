import type { RegisterOptions } from 'react-hook-form';

import type { InputProps } from './common/input';

export interface Field<T extends string> {
  name: T;
  registerOptions?: RegisterOptions;
  inputProps?: InputProps;
}
