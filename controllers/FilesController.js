import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import path from 'path';

class FilesController {
  static async postUpload(request, response) {
    const { name, type, parentId = 0, isPublic = false, data } = request.body;
    const token = request.header('X-Token');

    if (!token) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }


    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }

    const validTypes = ['folder', 'file', 'image'];
    if (!type || !validTypes.includes(type)) {
      return response.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return response.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
      if (!parentFile) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      return response.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }

    const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(FOLDER_PATH)) {
      fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }

    const fileId = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileId);

    try {
      const buffer = Buffer.from(data, 'base64');
      await fs.promises.writeFile(localPath, buffer);
    } catch (error) {
      return response.status(500).json({ error: 'Error saving file' });
    }

    fileDocument.localPath = localPath;

    const result = await dbClient.db.collection('files').insertOne(fileDocument);

    return response.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });
  }
}

export default FilesController;
