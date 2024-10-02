import { expect } from 'chai';
import sinon from 'sinon';
import redisClient from '../utils/redis';

describe('redisClient', () => {
  it('should connect to Redis', (done) => {
    redisClient.getClient.on('ready', () => {
      expect(redisClient.isAlive()).to.be.true;
      done();
    });
  });

  it('should set and get values from Redis', (done) => {
    redisClient.set('test_key', 'test_value', 60);
    redisClient.get('test_key', (err, value) => {
      expect(value).to.equal('test_value');
      done();
    });
  });

  it('should delete a key from Redis', (done) => {
    redisClient.set('test_key', 'test_value', 60);
    redisClient.del('test_key');
    redisClient.get('test_key', (err, value) => {
      expect(value).to.be.null;
      done();
    });
  });
});
