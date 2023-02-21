import type { NextApiHandler, PageConfig } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

import { prisma } from '../../../server/prisma';
import { getSession } from '../../../utils/session';

interface ParseResult {
  status: number;
  message: string;
}

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req, res });
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (req.method?.toLowerCase() !== 'post') {
    res.status(405).json({ message: 'Unsupported method' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, profile: { select: { avatarUrl: true } } },
  });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const avatarsPath = path.resolve(
    process.env.UPLOADS_URL as string,
    'avatars',
  );

  const form = formidable({
    uploadDir: avatarsPath,
    keepExtensions: true,
  });

  try {
    const { status, message } = await new Promise<ParseResult>((resolve) => {
      form.parse(req, (err, _, files) => {
        if (err) {
          resolve({ status: 400, message: 'Bad request' });
        } else {
          const fileValues = Object.values(files);
          if (!fileValues.length) {
            resolve({ status: 500, message: 'Error saving file' });
          }

          const { newFilename } = Array.isArray(fileValues[0])
            ? fileValues[0][0]
            : fileValues[0];
          const avatarUrl = `/avatars/${newFilename}`;

          prisma.profile
            .update({
              where: { userId: user.id },
              data: { avatarUrl },
            })
            .then(() => {
              if (user.profile?.avatarUrl) {
                const splittedPath = user.profile.avatarUrl.split('/');
                const prevFilename = splittedPath[splittedPath.length - 1];
                return fs.rm(path.join(avatarsPath, prevFilename));
              }
            })
            .then(() => {
              resolve({ status: 200, message: avatarUrl });
            });
        }
      });
    });

    res
      .status(status)
      .json({ [status === 200 ? 'avatarUrl' : 'message']: message });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default handler;
