const createModels = require('../models');

module.exports = {
  async initDatabase(ctx) {
    createModels(ctx.conn);
    return await ctx.conn.sync({ alter: true });
  },
};
