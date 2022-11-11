import type { FC, HTMLProps } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

type Space = Prisma.SpaceGetPayload<{
  include: {
    creator: { select: { username: true; id: true } };
  };
}>;

interface Action {
  text: string;
  navigate?: boolean;
  onAction?: (id: number) => void | Promise<void>;
  loading?: boolean;
}

interface Props extends Omit<HTMLProps<HTMLUListElement>, 'action'> {
  spaces: Space[];
  action?: Action;
}

const SpacesList: FC<Props> = ({ spaces, action, ...rest }) => (
  <ul {...rest}>
    {spaces.map(({ id, name, creator: { username } }) => (
      <li
        key={id}
        className="card card-compact list-item w-full bg-base-100 shadow-xl [&:not(:last-child)]:mb-4"
      >
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <p className="text-secondary text-md">
            Created by <span className="font-bold">{username}</span>
          </p>
          {action && (
            <div className="card-actions justify-end">
              {action.navigate ? (
                <Link
                  href={`/app/space/${id}`}
                  className="btn btn-primary btn-outline"
                >
                  {action.text}
                </Link>
              ) : (
                <button
                  className={`btn btn-primary btn-outline${
                    action.loading ? ' loading' : ''
                  }`}
                  onClick={() => action.onAction?.(id)}
                >
                  {action.text}
                </button>
              )}
            </div>
          )}
        </div>
      </li>
    ))}
  </ul>
);

export default SpacesList;
