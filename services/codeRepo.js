const gitlab = require('./gitlab');

const repoMap = {
  gitlab: gitlab,
};

class CodeRepo {
  constructor(type) {
    return new repoMap[type]();
  }
}

module.exports = CodeRepo;
