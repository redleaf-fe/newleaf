const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20);

module.exports = {
  Database: require('./database'),
  CodeRepo: require('./codeRepo'),

  async idGenerate({ ctx, modelName, idName }) {
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
  },

  async findRepeat({ ctx, modelName, queryKey, queryObj, repeatMsg }) {
    // 查询重复的记录
    const findRepeat = await ctx.conn.models[modelName].findOne({
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

  async namespaceHasAccess({ ctx, id, user_id, type, validateSelf = false }) {
    // 项目和分组操作是否有权限
    const reqMap = {
      group: ctx.codeRepo.getUserOfGroup,
      app: ctx.codeRepo.getUserOfProject,
    };

    const res = await reqMap[type]({ id, user_id: ctx.gitUid });

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
