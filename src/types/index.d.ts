import type { PrismaClient } from '@prisma/client';
import type Pusher from 'pusher';

declare global {
  var prisma: PrismaClient | undefined;
  var pusher: Pusher | undefined;
}
