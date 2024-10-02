import { expect } from 'chai';
import dbClient from '../utils/db';

describe('dbClient', () => {
  it('should connect to MongoDB correctly', (done) => {
    expect(dbClient.isAlive()).to.be.true;
    done();
  });

  it('should return the number of users in database', async () => {
    const totalUsers = await dbClient.nbUsers();
    expect(totalUsers).to.be.a('number');
  });

  it('should return the number of files in  database', async () => {
    const totalFiles = await dbClient.nbFiles();
    expect(totalFiles).to.be.a('number');
  });
});
