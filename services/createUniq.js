module.exports = {
  // 创建时检查重复
  async createUniq({
    ctx,
    modelName,
    queryKey,
    queryObj,
    repeatMsg,
    createObj
  }) {
    // 查询重复的记录
    const findRepeat = await ctx.conn.models[modelName].findAll({
      attributes: queryKey,
      where: queryObj
    });

    if (findRepeat.length > 0) {
      ctx.status = 400;
      ctx.body = JSON.stringify({ message: repeatMsg });
      return false;
    }

    await ctx.conn.models[modelName].create(createObj);

    return true;
  }
};
