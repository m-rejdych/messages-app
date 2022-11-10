import type { FC, HTMLProps } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

type Space = Prisma.SpaceGetPayload<{
  include: {
    creator: { select: { username: true; id: true } };
  };
}>;

interface Props extends HTMLProps<HTMLUListElement> {
  spaces: Space[];
}

const SpacesList: FC<Props> = ({ spaces, ...rest }) => {
  return (
    <ul {...rest}>
      {spaces.map(({ id, name, creator: { username } }) => (
        <li
          key={id}
          className="card w-full bg-base-100 shadow-xl [&:not(:last-child)]:mb-4"
        >
          <div className="card-body">
            <h2 className="card-title">{name}</h2>
            <p className="text-secondary text-md">
              Created by <span className="font-bold">{username}</span>
            </p>
            <div className="card-actions justify-end">
              <Link
                href={`/app/space/${id}`}
                className="btn btn-primary btn-outline"
              >
                Go!
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SpacesList;
