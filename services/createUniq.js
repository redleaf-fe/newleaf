// 创建时检查重复
module.exports = async ({
  ctx,
  modelName,
  queryKey,
  queryObj,
  repeatMsg,
  createObj,
}) => {
  // 查询重复的记录
  const findRepeat = await ctx.conn.models[modelName].findOne({
    attributes: queryKey,
    where: queryObj,
  });

  if (findRepeat) {
    ctx.status = 400;
    ctx.body = JSON.stringify({ message: repeatMsg });
    return false;
  }

  await ctx.conn.models[modelName].create(createObj);

  return true;
};
