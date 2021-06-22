const { sessionValidTime } = require('../env.json');

module.exports = async (ctx, next) => {
  const whiteList = ['/', '/login/login', '/login/register'];
  if (ctx.method === 'OPTIONS' || whiteList.includes(ctx.path)) {
    await next();
    return;
  }

  const token = ctx.cookies.get('token');

  if (!token) {
    gotoLogin();
  } else {
    const res = await ctx.conn.models.login.findOne({
      attributes: ['uid', 'gitUid', 'updatedAt'],
      where: { loginToken: token },
    });
    if (res) {
      // cookie中的token超过时间也要重新登录，并删除login中的记录
      if (sessionValidTime <= new Date() - new Date(res.updatedAt)) {
        gotoLogin();
        await ctx.conn.models.login.destroy({
          where: { loginToken: token },
        });
      } else {
        // 方便后面的逻辑获取用户id；cookie中有username，但是因为cookie可以手动修改，所以不使用username做任何写操作
        ctx.uid = res.uid;
        ctx.gitUid = res.gitUid;
        await next();
      }
    } else {
      gotoLogin();
    }
  }

  function gotoLogin() {
    ctx.status = 302;
    ctx.body = { redirectUrl: '/login' };
  }
};
