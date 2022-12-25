import type { Field } from '../../types/form';

export const DEFAULTS = {
  name: '',
  isPrivate: false,
};

export const FIELDS: Field<keyof typeof DEFAULTS>[] = [
  {
    name: 'name',
    inputProps: {
      label: 'Name',
      placeholder: 'space name',
    },
    registerOptions: {
      setValueAs: (value: string) => value.trim(),
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
  {
    name: 'isPrivate',
    inputProps: {
      label: 'Private',
    },
  },
];
