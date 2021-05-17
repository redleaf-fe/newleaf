const { nanoid } = require('nanoid');

module.exports = async ({ ctx, modelName, idName }) => {
  let id = nanoid(20);
  let res = await ctx.conn.models[modelName].findAll({
    attributes: [idName],
    where: { [idName]: id },
  });

  while (res.length > 0) {
    id = nanoid(20);
    res = await ctx.conn.models[modelName].findAll({
      attributes: [idName],
      where: { [idName]: id },
    });
  }

  return id;
};
