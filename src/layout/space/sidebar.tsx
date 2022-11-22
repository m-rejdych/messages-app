import type { FC } from 'react';

import type { RouterOutputs } from '../../utils/trpc';

type Space = RouterOutputs['space']['getById'];

const Sidebar: FC<Pick<Space, 'name' | 'members'>> = ({ name, members }) => {
  return (
    <div className="w-1/3 md:w-1/4 pr-4">
      <h3 className="text-xl mb-4 font-bold">{name}</h3>
      <div className="divider" />
      <h4 className="text-lg font-bold mb-4">Channels</h4>
      <h4 className="text-lg font-bold mb-4">Direct messages</h4>
      <ul className="mb-4 ml-2">
        {members.map(({ id, user: { username } }) => (
          <li key={id} className="[&:not(:last-child)]:mb-2">
            <p>{username}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
