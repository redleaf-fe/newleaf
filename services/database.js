const createModels = require('../models');

module.exports = {
  async initDatabase(seq) {
    createModels(seq);
    return await seq.sync({ alter: true });
  },
};
