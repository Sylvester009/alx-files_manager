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
        .collection("users")
        .findOne({ email });
      if (userExist) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashPassword = sha1(password);

      const newUser = {
        email: email,
        password: hashPassword,
      };

      const result = await dbClient.db.collection('users').insertOne(newUser);

      return response.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

module.exports = UsersController;
