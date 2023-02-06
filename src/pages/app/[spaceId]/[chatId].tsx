import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import HashLoader from 'react-spinners/HashLoader';

import AppLayout from '../../../layout/app';
import SpaceLayout from '../../../layout/space';
import useAuthError from '../../../hooks/useAuthError';
import useChatSubscription from '../../../hooks/useChatSubscription';
import { getAuthedServerSideProps } from '../../../utils/session';
import { trpc, type RouterOutputs } from '../../../utils/trpc';
import type { NextPageWithLayout } from '../../../types/page';

const TAKE = 20 as const;

type Message = RouterOutputs['chat']['getById']['chat']['messages'][number];

const Chat: NextPageWithLayout = () => {
  const [value, setValue] = useState('');
  const { query } = useRouter();
  const onError = useAuthError();
  const spaceId = parseInt(query.spaceId as string, 10);
  const chatId = parseInt(query.chatId as string, 10);
  const utils = trpc.useContext();
  const messagesWindowRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const {
    data,
    isInitialLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetched,
    fetchNextPage,
  } = trpc.chat.getById.useInfiniteQuery(
    {
      chatId,
      spaceId,
      take: TAKE,
    },
    {
      getNextPageParam: (page) => page.cursor,
      keepPreviousData: true,
      onError,
    },
  );
  const sendMessageMutation = trpc.message.send.useMutation();

  const moveToBottom = (): void => {
    if (!messagesWindowRef.current || !isFetched) return;

    messagesWindowRef.current.scrollTop =
      messagesWindowRef.current.scrollHeight;
  };

  const addMessage = (msg: Message): void => {
    utils.chat.getById.setInfiniteData(
      { chatId, spaceId, take: TAKE },
      (prev) =>
        prev && {
          ...prev,
          pages: prev.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  chat: {
                    ...page.chat,
                    messages: [msg, ...page.chat.messages],
                  },
                }
              : page,
          ),
        },
    );

    setTimeout(moveToBottom, 0);
  };

  const { socketId } = useChatSubscription(spaceId, chatId, addMessage);

  useEffect(moveToBottom, [isFetched]);

  useEffect(() => {
    if (!lastMessageRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;

      fetchNextPage();
      observer.unobserve(entry.target);
    });
    observer.observe(lastMessageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage]);

  if (!session) return null;

  const messages =
    data?.pages.reduce<Message[]>(
      (acc, { chat: { messages } }) => [...acc, ...messages],
      [],
    ) ?? [];

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
        <h1 className="text-4xl text-secondary">
          {error.shape?.data.httpStatus === 404
            ? 'Chat not found'
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

  const isMyMessage = (authorId?: number): boolean =>
    authorId === session.user.id;

  return (
    <div className="h-full">
      <div className="h-full border rounded-md border-neutral">
        <div
          ref={messagesWindowRef}
          className="flex flex-col-reverse h-4/5 p-4 border-b border-neutral overflow-auto"
        >
          {messages.length ? (
            messages.map(({ id, content, author }, index) => (
              <div
                ref={index === messages.length - 1 ? lastMessageRef : undefined}
                key={id}
                className={`chat ${
                  isMyMessage(author?.user.id) ? 'chat-end' : 'chat-start'
                }`}
              >
                <div className="chat-header opacity-70">
                  {author?.user.profile?.displayName ?? 'unknown user'}
                </div>
                <div
                  className={`chat-bubble${
                    isMyMessage(author?.user.id) ? ' chat-bubble-secondary' : ''
                  }`}
                >
                  {content}
                </div>
              </div>
            ))
          ) : (
            <div className="grid place-items-center h-full">
              <h1 className="text-2xl text-secondary">
                You have no messages yet
              </h1>
            </div>
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
