const User = require('./user');
const Group = require('./group');
const Project = require('./project');

class Gitlab {
  constructor() {
    [User, Group, Project].forEach((v) => {
      Object.keys(v).forEach((vv) => {
        this[vv] = v[vv];
      });
    });
  }
}

module.exports = Gitlab;
