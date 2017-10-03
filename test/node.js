const { expect } = require('chai');

const FormData = require('../src/node/FormData');

require('./base')('node', {
  'FormData length is predictable': () => {
    const f = new FormData();
    f.append('name', 'value');
    expect(f.length).to.equal(76);
  },
});
