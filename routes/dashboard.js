const Router = require('koa-router');

const router = new Router();

router.get('/get', async (ctx) => {
  const { key } = ctx.request.query;

  ctx.body = await ctx.redis.hgetallAsync(key);
});

module.exports = router.routes();
