import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import type { RouterOutputs } from '../utils/trpc';

import { pusherAtom } from '../atoms/pusher';
import { Event } from '../types/events';

export type Message = RouterOutputs['message']['send'];

type UseChatSubscription = (
  spaceId: number,
  chatId: number,
  newMsgCb: (msg: Message) => void,
) => { socketId?: string };

const useChatSubscription: UseChatSubscription = (
  spaceId,
  chatId,
  newMsgCb,
) => {
  const pusher = useAtomValue(pusherAtom);

  useEffect(() => {
    if (!pusher) return;

    const chatChannel = pusher.subscribe(`private-sp-${spaceId}-ch-${chatId}`);

    chatChannel.bind(Event.NewMessage, newMsgCb);

    return () => {
      chatChannel.unbind_all();
      chatChannel.unsubscribe();
    };
  }, [pusher, spaceId, chatId]);

  return { socketId: pusher?.connection.socket_id };
};

export default useChatSubscription;
