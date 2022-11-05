import type { Field } from '../../types/form';

export const DEFAULTS = {
  name: '',
};

export const FIELDS: Field<keyof typeof DEFAULTS>[] = [
  {
    name: 'name',
    inputProps: {
      label: 'Name',
      placeholder: 'space name',
    },
    registerOptions: {
      required: {
        value: true,
        message: 'Space name is required.',
      },
      minLength: {
        value: 2,
        message: 'Space name needs to be at least 2 characters long.',
      },
    },
  },
];
