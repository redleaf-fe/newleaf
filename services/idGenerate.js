const { nanoid } = require('nanoid');

module.exports = async ({ ctx, modelName, idName }) => {
  let id = nanoid(20);
  let res = await ctx.conn.models[modelName].findOne({
    attributes: [idName],
    where: { [idName]: id },
  });

  while (res) {
    id = nanoid(20);
    res = await ctx.conn.models[modelName].findOne({
      attributes: [idName],
      where: { [idName]: id },
    });
  }

  return id;
};
