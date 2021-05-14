const { sessionValidTime } = require('../env.json');

module.exports = async (ctx, next) => {
  const whiteList = ['/'];
  if (whiteList.includes(ctx.path)) {
    await next();
    return;
  }

  const token = ctx.cookies.get('token');

  if (!token) {
    gotoLogin();
  } else {
    const res = await ctx.conn.models.login.findAll({
      attributes: ['uid', 'updatedAt'],
      where: { loginToken: token },
    });
    if (res.length > 0) {
      // cookie中的token超过时间也要重新登录
      if (sessionValidTime <= new Date() - new Date(res[0].updatedAt)) {
        gotoLogin();
      } else {
        // 方便后面的逻辑获取用户id；cookie中有userName，但是因为cookie可以手动修改，所以不使用userName做任何写操作
        ctx.uid = res[0].uid;
        await next();
      }
    } else {
      gotoLogin();
    }
  }

  function gotoLogin() {
    ctx.status = 302;
    ctx.body = JSON.stringify({ redirectUrl: '/login' });
  }
};
