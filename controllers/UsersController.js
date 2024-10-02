const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    try {
      const userExist = await dbClient.db
        .collection('users')
        .findOne({ email });
      if (userExist) {
        return response.status(400).json({ error: 'Already exist' });
      }

      const hashPassword = sha1(password);

      const newUser = {
        email: email,
        password: hashPassword,
      };

      const answer = await dbClient.db.collection('users').insertOne(newUser);

      return response.status(201).json({
        id: answer.insertedId,
        email: newUser.email,
      });
    } catch (error) {
      return response.status(500).json({ error });
    }
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    if (!token) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db
      .collection('users')
      .findOne({ _id: dbClient.ObjectId(userId) });
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    return response.status(200).json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
