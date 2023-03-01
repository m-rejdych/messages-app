import { useState, type FC, type HTMLProps } from 'react';
import { MdModeEdit, MdCheck, MdClose } from 'react-icons/md';

interface Props extends HTMLProps<HTMLDivElement> {
  value: string | number;
  label?: string;
  onAccept?: (value: string) => void | Promise<void>;
  validate?: (value: string) => string | null;
}

const InlineEditor: FC<Props> = ({
  value,
  label,
  onAccept,
  validate,
  ...rest
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = (): void => {
    setEditing(false);
    setError('');
    setSubmitted(false);
    setInputValue(value.toString());
  };

  const handleAccept = async (): Promise<void> => {
    if (validate && !submitted) {
      setSubmitted(true);

      const msg = validate(inputValue);
      if (msg) {
        setError(msg);
        return;
      } else {
        setError('');
      }
    }

    setLoading(true);

    if (onAccept) {
      await onAccept(inputValue);
    }

    setLoading(false);
    setEditing(false);
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== 'Enter') return;

    handleAccept();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;

    setInputValue(newValue);

    if (validate && submitted) {
      const msg = validate(newValue);
      setError(msg ?? '');
    }
  };

  return (
    <div {...rest}>
      {label && <h3 className="text-sm text-secondary mb-2">{label}</h3>}
      <div className="flex items-center justify-between">
        {editing ? (
          <input
            autoFocus
            value={inputValue}
            className="input input-sm input-primary w-full mr-4"
            onChange={handleChange}
            onKeyDown={handleKeydown}
          />
        ) : (
          <p className="text-xl">{value}</p>
        )}
        {editing ? (
          <div className="flex">
            <button
              className={`btn btn-sm btn-square btn-success mr-2${
                loading ? ' loading' : ''
              }`}
              onClick={handleAccept}
            >
              <MdCheck className="text-xl" />
            </button>
            <button
              onClick={handleCancel}
              className={`btn btn-sm btn-square btn-error${
                loading ? ' disabled' : ''
              }`}
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-sm btn-square"
            onClick={() => setEditing(true)}
          >
            <MdModeEdit className="text-xl" />
          </button>
        )}
      </div>
      {error && <p className="text-sm text-error mt-2">{error}</p>}
    </div>
  );
};

export default InlineEditor;
