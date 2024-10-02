const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(request, response) {
    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const baseCredential = auth.split(' ')[1];
    const decodeCredential = Buffer.from(
      baseCredential,
      'base64'
    ).toString('ascii');
    const [email, password] = decodeCredential.split(':');

    if (!email || !password) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(password);
    const user = await dbClient.db
      .collection('users')
      .findOne({ email, password: hashedPassword });

    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const tokenKey = `auth_${token}`;

    await redisClient.set(tokenKey, user._id.toString(), 60 * 60 * 24);

    return response.status(200).json({ token });
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);

    return response.status(204).send();
  }
}

module.exports = AuthController;
