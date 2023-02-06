import type { FC, HTMLProps, Ref } from 'react';
import { Prisma } from '@prisma/client';

import CardsList from '../common/cardsList';
import type { Action } from '../common/cardsList';

export type Space = Prisma.SpaceGetPayload<{
  include: {
    creator: { select: { profile: { select: { displayName: true } } } };
    members: { select: { userId: true } };
  };
}>;

interface Props extends Omit<HTMLProps<HTMLUListElement>, 'action'> {
  spaces: Space[];
  action?: Action | ((id: number) => Action | undefined);
  lastItemRef?: Ref<HTMLLIElement> | null;
}

const SpacesList: FC<Props> = ({ spaces, action, lastItemRef, ...rest }) => (
  <CardsList
    {...rest}
    items={spaces.map(({ id, name, creator }) => ({
      id,
      label: name,
      sublabel: creator?.profile?.displayName ?? 'unknown user',
    }))}
    action={action}
    renderSublabel={(username) => (
      <p className="text-secondary text-lg">
        Created by <span className="font-bold">{username}</span>
      </p>
    )}
    lastItemRef={lastItemRef}
  />
);

export default SpacesList;
