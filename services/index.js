const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20);

module.exports = {
  Database: require('./database'),
  CodeRepo: require('./codeRepo'),

  async idGenerate({ ctx, modelName, idName }) {
    let id = nanoid();
    let res = await ctx.seq.models[modelName].findOne({
      attributes: [idName],
      where: { [idName]: id },
    });

    while (res) {
      id = nanoid();
      res = await ctx.seq.models[modelName].findOne({
        attributes: [idName],
        where: { [idName]: id },
      });
    }

    return id;
  },

  async findRepeat({ ctx, modelName, queryKey, queryObj, repeatMsg }) {
    // 查询重复的记录
    const findRepeat = await ctx.seq.models[modelName].findOne({
      attributes: queryKey,
      where: queryObj,
    });

    if (findRepeat) {
      ctx.status = 400;
      ctx.body = { message: repeatMsg };
      return true;
    }

    return false;
  },

  async hasAppAccess({ ctx, id, user_id, validateSelf = false }) {
    const res = await ctx.codeRepo.getUserOfProject({
      id,
      user_id: ctx.gitUid,
    });

    if (res.data.access_level < 40) {
      return false;
    }

    // 不能操作自己
    if (validateSelf && +ctx.gitUid === +user_id) {
      return false;
    }

    return true;
  },
};
