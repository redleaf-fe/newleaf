const User = require('./user');
const Project = require('./project');

class Gitlab {
  constructor() {
    [User, Project].forEach((v) => {
      Object.keys(v).forEach((vv) => {
        this[vv] = v[vv];
      });
    });
  }
}

module.exports = Gitlab;
