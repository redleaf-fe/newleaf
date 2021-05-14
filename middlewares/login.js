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
      attributes: ['uid'],
      where: { loginToken: token }
    });
    if (res.length > 0) {
      // 方便后面的逻辑获取用户id
      ctx.uid = res[0].uid;
      await next();
    } else {
      gotoLogin();
    }
  }

  function gotoLogin() {
    ctx.status = 302;
    ctx.body = JSON.stringify({ redirectUrl: '/login' });
  }
};
