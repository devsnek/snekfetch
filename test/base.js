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

describe('snekfetch', () => {
  it('should return a promise', () => {
    const p = snek.get(base).end();
    expect(p).to.be.an.instanceof(Promise);
    expect(p).to.have.property('then');
  });

  it('should reject with error on network failure', () => {
    const invalid = 'http://localhost:6969';
    return expect(snek.get(invalid).end()).to.eventually.be.rejected
      .and.be.an.instanceOf(Error);
  });
});
