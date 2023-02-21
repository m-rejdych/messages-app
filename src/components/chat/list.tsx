import type { FC, HTMLProps } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ListItem {
  id: number;
  text: string;
  selected?: boolean;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface Props extends HTMLProps<HTMLUListElement> {
  spaceId: number;
  items: ListItem[];
}

const ChatsList: FC<Props> = ({ spaceId, items, className, ...rest }) => (
  <ul {...rest} className={`flex-1${className ? ` ${className}` : ''}`}>
    {items.map(({ id, text, avatarUrl, selected, isOnline }) => (
      <li
        key={id}
        className={`[&:not(:last-child)]:mb-2 px-2 py-1 rounded-md w-full text-left hover:bg-neutral${
          selected ? ' bg-neutral' : ''
        }`}
      >
        <Link
          href={`/app/${spaceId}/${id}`}
          className="flex items-center cursor-pointer w-full"
        >
          <div
            className={`mr-3 avatar${avatarUrl ? '' : ' placeholder'}${
              isOnline ? ' online' : ''
            }`}
          >
            <div className="bg-neutral-focus text-neutral-content rounded-full w-7 h-7">
              {avatarUrl ? (
                <Image
                  priority
                  width={28}
                  height={28}
                  src={avatarUrl}
                  alt="profile-avatar"
                />
              ) : (
                <span>{text[0].toUpperCase()}</span>
              )}
            </div>
          </div>
          {text}
        </Link>
      </li>
    ))}
  </ul>
);

export default ChatsList;
