const UserMethod = require('./user');
const GroupMethod = require('./group');

class Gitlab {
  constructor() {
    [UserMethod, GroupMethod].forEach((v) => {
      Object.keys(v).forEach((vv) => {
        this[vv] = v[vv];
      });
    });
  }
}

module.exports = Gitlab;
