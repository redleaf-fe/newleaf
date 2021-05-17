const { nanoid } = require('nanoid');

module.exports = async ({ ctx, modelName }) => {
  let uid = nanoid(20);
  let res = await ctx.conn.models[modelName].findAll({
    attributes: ['uid'],
    where: { uid },
  });

  while (res.length > 0) {
    uid = nanoid(20);
    res = await ctx.conn.models[modelName].findAll({
      attributes: ['uid'],
      where: { uid },
    });
  }

  return uid;
};
