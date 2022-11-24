import type { FC, HTMLProps } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

export type Space = Prisma.SpaceGetPayload<{
  include: {
    creator: { select: { username: true; id: true } };
    members: { select: { userId: true } };
  };
}>;

export interface Action {
  text: string;
  navigate?: boolean;
  onAction?: (id: number) => void | Promise<void>;
  loading?: boolean;
  inactive?: boolean;
}

interface Props extends Omit<HTMLProps<HTMLUListElement>, 'action'> {
  spaces: Space[];
  action?: Action | ((space: Space) => Action | undefined);
}

const SpacesList: FC<Props> = ({ spaces, action, ...rest }) => {
  const renderSpace = (space: Space): React.ReactElement => {
    const resolvedAction =
      typeof action === 'function' ? action(space) : action;

    const {
      id,
      name,
      creator: { username },
    } = space;

    return (
      <li
        key={id}
        className="card card-compact list-item w-full bg-base-100 shadow-xl [&:not(:last-child)]:mb-4"
      >
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <p className="text-secondary text-md">
            Created by <span className="font-bold">{username}</span>
          </p>
          {resolvedAction && (
            <div className="card-actions justify-end">
              {resolvedAction.inactive ? (
                <h3 className="text-accent text-lg font-semibold">{resolvedAction.text}</h3>
              ) : resolvedAction.navigate ? (
                <Link
                  href={`/app/${id}`}
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

  return <ul {...rest}>{spaces.map(renderSpace)}</ul>;
};
export default SpacesList;
