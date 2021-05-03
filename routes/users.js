const Router = require('koa-router');
const router = new Router();

router.get('/', (ctx) => {
  const { user } = ctx.request.query;
  ctx.ok({ user });
});

module.exports = router.routes();
