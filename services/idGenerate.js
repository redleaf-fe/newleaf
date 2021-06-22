const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20);

module.exports = async ({ ctx, modelName, idName }) => {
  let id = nanoid();
  let res = await ctx.conn.models[modelName].findOne({
    attributes: [idName],
    where: { [idName]: id },
  });

  while (res) {
    id = nanoid();
    res = await ctx.conn.models[modelName].findOne({
      attributes: [idName],
      where: { [idName]: id },
    });
  }

  return id;
};
