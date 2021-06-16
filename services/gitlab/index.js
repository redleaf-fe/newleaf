const { createUser } = require('./user');

class Gitlab {
  constructor() {
    this.createUser = createUser;
  }
}

module.exports = Gitlab;
