const Router = require('koa-router');
const router = new Router();

router.get('/list', async (ctx) => {
  // todo: 搜索条件
  // const { user } = ctx.request.query;
  const res = await ctx.conn.models.user.findAll({
    attributes: ['appList'],
    where: { uid: ctx.uid }
  });
  ctx.body = JSON.stringify(res);
});

router.get('/create', async (ctx) => {
  const { appName } = ctx.request.body;

  await ctx.conn.models.app.create({
    attributes: ['appList'],
    where: { uid: ctx.uid }
  });
  ctx.body = JSON.stringify({ message: '创建成功' });
});

module.exports = router.routes();
