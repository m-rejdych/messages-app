import type { NextApiHandler } from 'next';

import { getSession } from '../../../utils/session';
import { pusher } from '../../../server/pusher';
import { prisma } from '../../../server/prisma';

const SPACE_CHANNEL_REGEX = /^presence-sp-\d+$/;
const CHAT_CHANNEL_REGEX = /^private-sp-\d+-ch-\d+$/;
const SPACE_PREFIX = '-sp-' as const;
const CHAT_PREFIX = '-ch-' as const;

interface Ids {
  spaceId: number | null;
  chatId: number | null;
}

const unwrapIds = (channel: string): Ids => {
  if (!(SPACE_CHANNEL_REGEX.test(channel) || CHAT_CHANNEL_REGEX.test(channel)))
    return { spaceId: null, chatId: null };

  const spaceIdIdx = channel.indexOf(SPACE_PREFIX) + SPACE_PREFIX.length;
  const spaceSlice = channel.slice(spaceIdIdx);
  if (!CHAT_CHANNEL_REGEX.test(channel))
    return { spaceId: parseInt(spaceSlice, 10), chatId: null };

  const [spaceId, chatId] = spaceSlice.split(CHAT_PREFIX).map(Number);

  return {
    spaceId,
    chatId,
  };
};

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') return res.status(404).send('NOT_FOUND');

  const { socket_id: socketId, channel_name: channel } = req.body;
  if (
    !socketId ||
    !(SPACE_CHANNEL_REGEX.test(channel) || CHAT_CHANNEL_REGEX.test(channel))
  )
    return res.status(403).send('UNAUTHORIZED');

  const session = await getSession({ req, res });
  if (!session) return res.status(403).send('UNAUTHORIZED');

  const { spaceId, chatId } = unwrapIds(channel);
  if (!spaceId) return res.status(403).send('UNAUTHORIZED');

  const membership = await prisma.membership.findFirst({
    where: { spaceId, userId: session.user.id },
    select: {
      id: true,
    },
  });
  if (!membership) return res.status(403).send('UNAUTHORIZED');

  const { id } = membership;

  if (chatId) {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, members: { some: { memberId: id } }, spaceId },
    });
    if (!chat) return res.status(403).send('UNAUTHORIZED');
  }

  const { name, email } = session.user;
  const user = channel.startsWith('presence')
    ? {
        user_id: id.toString(),
        user_info: {
          name,
          email,
        },
      }
    : undefined;

  const response = pusher.authorizeChannel(socketId, channel, user);

  res.send(response);
};

export default handler;
