const createModels = require('../models');

module.exports = {
  async initDatabase(ctx) {
    createModels(ctx);
    return await ctx.conn.sync();
  },
};
