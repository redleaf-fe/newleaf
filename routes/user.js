const Router = require('koa-router');
const router = new Router();

router.get('/', (ctx) => {
  const { user } = ctx.request.query;
  ctx.body = JSON.stringify({ user });
});

module.exports = router.routes();
