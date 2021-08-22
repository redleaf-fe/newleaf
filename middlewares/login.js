const redisKey = require('../redisKey');

module.exports = async (ctx, next) => {
  const whitePathList = [
    '/login/login',
    '/login/register',
    '/publish/getShouldPublish',
    '/publish/publishResult',
    '/publish/buildServer',
    '/publish/buildResult',
  ];
  const whiteReqList = ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'];

  if (!whiteReqList.includes(ctx.method) || whitePathList.includes(ctx.path)) {
    await next();
    return;
  }

  const token = ctx.cookies.get('token');

  if (!token) {
    gotoLogin();
  } else {
    const tokenKey = redisKey.loginTokenUid(token);
    const res = await ctx.redis.existsAsync(tokenKey);
    if (+res) {
      const uid = await ctx.redis.getAsync(tokenKey);
      const res2 = await ctx.redis.hgetallAsync(redisKey.loginInfo(uid));
      // 方便后面的逻辑获取用户id；cookie中有username，但是因为cookie可以手动修改，所以不使用username做任何写操作
      ctx.uid = uid;
      ctx.gitUid = res2.gitUid;
      ctx.username = res2.username;
      await next();
    } else {
      gotoLogin();
    }
  }

  function gotoLogin() {
    ctx.status = 302;
    ctx.body = { redirectUrl: '/page/login' };
  }
};
