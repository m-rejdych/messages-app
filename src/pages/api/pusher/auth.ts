import type { NextApiHandler } from 'next';

import { getSession } from '../../../utils/session';
import { pusher } from '../../../server/pusher';
import { prisma } from '../../../server/prisma';

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') return res.status(404).send('NOT_FOUND');

  const socketId = req.body.socket_id;
  if (!socketId) return res.status(403).send('UNAUTHORIZED');

  const session = await getSession({ req, res });
  if (!session) return res.status(403).send('UNAUTHORIZED');

  const spaceId = parseInt(req.body.spaceId, 10) || null;
  if (!spaceId) return res.status(403).send('UNAUTHORIZED');

  const membership = await prisma.membership.findFirst({
    where: { spaceId, userId: session.user.id },
    select: {
      id: true,
      space: { select: { members: { select: { id: true } } } },
    },
  });
  if (!membership) return res.status(403).send('UNAUTHORIZED');

  const {
    id,
    space: { members },
  } = membership;
  const { name, email } = session.user;

  const user = {
    id: id.toString(),
    user_info: {
      name,
      email,
    },
    watchlist: members
      .filter(({ id: memberId }) => id !== memberId)
      .map(({ id }) => id.toString()),
  };

  const response = pusher.authenticateUser(socketId, user);

  res.send(response);
};

export default handler;
