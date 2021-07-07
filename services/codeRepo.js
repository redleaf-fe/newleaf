const gitlab = require('./gitlab');
const gogs = require('./gogs');

const repoMap = {
  gitlab: gitlab,
  gogs: gogs,
};

class CodeRepo {
  constructor(type) {
    return new repoMap[type]();
  }
}

module.exports = CodeRepo;
