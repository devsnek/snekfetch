/* global it describe before after */

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const local = require('./server');
const base = `http://${local.hostname}:${local.port}/`;

before((done) => {
  local.start(done);
});

after((done) => {
  local.stop(done);
});


const snek = require('../');

module.exports = (scope) => {
  describe(`snekfetch - ${scope}`, () => {
    it('should return a promise', () => {
      expect(snek.get(base).end()).to.be.an.instanceof(Promise);
    });

    it('should reject with error on network failure', () => {
      const invalid = 'http://localhost:6969';
      return expect(snek.get(invalid).end()).to.eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });

    it('should resolve into response', () => snek.get(base).then((res) => {
      expect(res.ok).to.be.true;
      expect(res.status).to.equal(200);
      expect(res.statusText).to.equal('OK');
    }));
  });
};
