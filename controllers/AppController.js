const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(request, response) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    response.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(request, response) {
    try {
      totalUsers = await dbClient.nbUsers();
      totalFiles = await dbClient.nbFiles();

      response.status(200).json({ users: totalUsers, files: totalFiles });
    } catch {
      response.status(500).json({ error: 'files can\'t be accessed' });
    }
  }
}

module.exports = AppController;
