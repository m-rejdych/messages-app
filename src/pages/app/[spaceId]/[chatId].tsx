import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import HashLoader from 'react-spinners/HashLoader';

import AppLayout from '../../../layout/app';
import SpaceLayout from '../../../layout/space';
import useAuthError from '../../../hooks/useAuthError';
import useChatSubscription, {
  type Message,
} from '../../../hooks/useChatSubscription';
import { getAuthedServerSideProps } from '../../../utils/session';
import { trpc } from '../../../utils/trpc';
import type { NextPageWithLayout } from '../../../types/page';

const Chat: NextPageWithLayout = () => {
  const [value, setValue] = useState('');
  const { query } = useRouter();
  const onError = useAuthError();
  const spaceId = parseInt(query.spaceId as string, 10);
  const chatId = parseInt(query.chatId as string, 10);
  const utils = trpc.useContext();
  const messagesWindowRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const { data, isInitialLoading, error } = trpc.chat.getById.useQuery(
    {
      chatId,
      spaceId,
    },
    {
      onError,
    },
  );
  const sendMessageMutation = trpc.message.send.useMutation();

  const addMessage = (msg: Message): void => {
    utils.chat.getById.setData(
      { chatId, spaceId },
      (prev) => prev && { ...prev, messages: [...prev.messages, msg] },
    );
  };

  const { socketId } = useChatSubscription(spaceId, chatId, addMessage);

  useEffect(() => {
    if (!messagesWindowRef.current) return;

    messagesWindowRef.current.scrollTop =
      messagesWindowRef.current.scrollHeight;
  }, [data?.messages.length]);

  if (!session?.user) return null;

  if (isInitialLoading) {
    return (
      <div className="h-full grid place-items-center">
        <HashLoader size={150} color="#3abff8" loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full grid place-items-center">
        <h1 className="text-4xl">
          {error.shape?.data.httpStatus === 404
            ? 'Space not found'
            : error.message}
        </h1>
      </div>
    );
  }

  if (!data) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setValue(e.target.value);
  };

  const handleSendMessage = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): Promise<void> => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();

    if (!value.trim().length) return;

    try {
      const message = await sendMessageMutation.mutateAsync({
        spaceId,
        chatId,
        socketId,
        content: value,
      });
      setValue('');
      addMessage(message);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const isMyMessage = (authorId: number): boolean =>
    authorId === session.user.id;

  return (
    <div className="h-full">
      <div className="h-full border rounded-md border-neutral">
        <div
          ref={messagesWindowRef}
          className="h-4/5 p-4 border-b border-neutral overflow-auto"
        >
          {data.messages.map(
            ({
              id,
              content,
              author: {
                user: { id: authorId, username },
              },
            }) => (
              <div
                key={id}
                className={`chat ${
                  isMyMessage(authorId) ? 'chat-end' : 'chat-start'
                }`}
              >
                <div className="chat-header opacity-70">{username}</div>
                <div
                  className={`chat-bubble${
                    isMyMessage(authorId) ? ' chat-bubble-secondary' : ''
                  }`}
                >
                  {content}
                </div>
              </div>
            ),
          )}
        </div>
        <div className="h-1/5 p-4">
          <textarea
            className="textarea textarea-bordered resize-none h-full w-full"
            placeholder="Enter a message"
            value={value}
            onChange={handleChange}
            onKeyDown={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

Chat.getLayout = (page) => (
  <AppLayout>
    <SpaceLayout>{page}</SpaceLayout>
  </AppLayout>
);

export { getAuthedServerSideProps as getServerSideProps };

export default Chat;
