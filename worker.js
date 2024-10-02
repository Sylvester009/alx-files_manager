import Queue from 'bull';
import { promises as fs } from 'fs';
import { ObjectID } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const bullQueue = new Queue('fileQueue', 'redis://127.0.0.1:8080');

bullQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const files = dbClient.db.collection('files');
  const objId = new ObjectID(fileId);
  const file = await files.findOne({ _id: objId, userId: new ObjectID(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'image') {
    throw new Error('File is not an image');
  }

  try {
    const thumbnailSizes = [500, 250, 100];
    const thumbnails = await Promise.all(thumbnailSizes.map(async (size) => {
      const thumbnail = await imageThumbnail(file.localPath, { width: size });
      const thumbnailPath = `${file.localPath}_${size}`;
      await fs.writeFile(thumbnailPath, thumbnail);
      return thumbnailPath;
    }));

    console.log(`Thumbnails generated and stored at: ${thumbnails.join(', ')}`);
    done();
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    done(error);
  }
});
