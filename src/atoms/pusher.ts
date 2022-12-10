import { atom } from 'jotai';
import type Pusher from 'pusher-js';

export const pusherAtom = atom<Pusher | null>(null);
