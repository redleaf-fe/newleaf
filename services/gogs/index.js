const User = require('./user');
const Group = require('./group');
const Project = require('./project');

class Gogs {
  constructor() {
    [User, Group, Project].forEach((v) => {
      Object.keys(v).forEach((vv) => {
        this[vv] = v[vv];
      });
    });
  }
}

module.exports = Gogs;
