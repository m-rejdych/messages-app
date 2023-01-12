import type { FC, HTMLProps } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

import CardsList from '../common/cardsList';
import type { Action } from '../common/cardsList';

export type Space = Prisma.SpaceGetPayload<{
  include: {
    creator: { select: { username: true; id: true } };
    members: { select: { userId: true } };
  };
}>;

interface Props extends Omit<HTMLProps<HTMLUListElement>, 'action'> {
  spaces: Space[];
  action?: Action | ((id: number) => Action | undefined);
}

const SpacesList: FC<Props> = ({ spaces, action, ...rest }) => (
  <CardsList
    {...rest}
    items={spaces.map(({ id, name, creator }) => ({
      id,
      label: name,
      sublabel: creator?.username ?? 'unknown user',
    }))}
    action={action}
    renderSublabel={(username) => (
      <p className="text-secondary text-lg">
        Created by <span className="font-bold">{username}</span>
      </p>
    )}
  />
);

export default SpacesList;
