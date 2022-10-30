import type { RegisterOptions } from 'react-hook-form';

import type { InputProps } from '../../types/common/input';

interface Field<T extends string> {
  name: T;
  registerOptions?: RegisterOptions;
  inputProps?: InputProps;
}

const EMAIL_REGEXP =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PASSWORD_REGEXP = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

export const LOGIN_DEFAULTS = {
  email: '',
  password: '',
};

export const REGISTER_DEFAULTS = {
  ...LOGIN_DEFAULTS,
  username: '',
};

export const LOGIN_FIELDS: Field<keyof typeof LOGIN_DEFAULTS>[] = [
  {
    name: 'email',
    registerOptions: {
      required: {
        message: 'Email is required.',
        value: true,
      },
      pattern: {
        message: 'Invalid email.',
        value: EMAIL_REGEXP,
      },
    },
    inputProps: {
      type: 'email',
      label: 'Email',
      placeholder: 'email',
    },
  },
  {
    name: 'password',
    registerOptions: {
      required: {
        message: 'Password is required.',
        value: true,
      },
    },
    inputProps: {
      type: 'password',
      label: 'Password',
      placeholder: 'password',
      helperText: {
        text: 'Forgot password?',
      },
    },
  },
];

export const REGISTER_FIELDS: Field<keyof typeof REGISTER_DEFAULTS>[] = [
  {
    name: 'username',
    registerOptions: {
      required: {
        message: 'Username is required.',
        value: true,
      },
      minLength: {
        message: 'Username should be at least 3 characters long.',
        value: 3,
      },
    },
    inputProps: {
      type: 'text',
      label: 'Username',
      placeholder: 'username',
    },
  },
  ...LOGIN_FIELDS.map((field) =>
    field.name === 'password'
      ? {
          ...field,
          registerOptions: {
            ...field.registerOptions,
            pattern: {
              message:
                'Password should be at least 6 characters long and contain digit and special character.',
              value: PASSWORD_REGEXP,
            },
          },
          inputProps: {
            ...field.inputProps,
            helperText: undefined,
          },
        }
      : field,
  ),
];
