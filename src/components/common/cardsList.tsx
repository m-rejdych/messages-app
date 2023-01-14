import type { FC, HTMLProps, ReactNode } from 'react';
import Link from 'next/link';

interface ListItem {
  id: number;
  label: string;
  sublabel?: string;
}

export interface Action {
  text: string;
  navigate?: {
    prefix: string;
    suffix?: string;
  };
  onAction?: (id: number) => void | Promise<void>;
  loading?: boolean;
  inactive?: boolean;
}

interface Props extends Omit<HTMLProps<HTMLUListElement>, 'action'> {
  items: ListItem[];
  action?: Action | ((id: number) => Action | undefined);
  renderLabel?: (label: string) => ReactNode;
  renderSublabel?: (sublabel: string) => ReactNode;
}

const CardsList: FC<Props> = ({
  items,
  action,
  renderLabel,
  renderSublabel,
  ...rest
}) => {
  const renderItem = ({ id, label, sublabel }: ListItem): ReactNode => {
    const resolvedAction = typeof action === 'function' ? action(id) : action;

    return (
      <li
        key={id}
        className="card card-compact list-item w-full bg-base-100 shadow-xl [&:not(:last-child)]:mb-4"
      >
        <div className="card-body">
          {renderLabel?.(label) ?? <h2 className="card-title">{label}</h2>}
          {sublabel &&
            (renderSublabel?.(sublabel) ?? (
              <p className="text-secondary text-sm">{sublabel}</p>
            ))}
          {resolvedAction && (
            <div className="card-actions justify-end">
              {resolvedAction.inactive ? (
                <h3 className="text-accent text-lg font-semibold">
                  {resolvedAction.text}
                </h3>
              ) : resolvedAction.navigate ? (
                <Link
                  href={`${resolvedAction.navigate.prefix}${id}${
                    resolvedAction.navigate.suffix ?? ''
                  }`}
                  onClick={resolvedAction.onAction}
                  className="btn btn-primary btn-outline"
                >
                  {resolvedAction.text}
                </Link>
              ) : (
                <button
                  className={`btn btn-primary btn-outline${
                    resolvedAction.loading ? ' loading' : ''
                  }`}
                  onClick={() => resolvedAction.onAction?.(id)}
                >
                  {resolvedAction.text}
                </button>
              )}
            </div>
          )}
        </div>
      </li>
    );
  };

  return <ul {...rest}>{items.map(renderItem)}</ul>;
};
export default CardsList;
