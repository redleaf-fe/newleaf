const Router = require('koa-router');
const { Database } = require('../services');
const { toPromise } = require('../utils');

const router = new Router();

router.get('/get-tables', async (ctx) => {
  const [err, rows] = await toPromise(Database.initDatabase(ctx));
  if (err) {
    ctx.body = JSON.stringify({ message: '初始化数据库失败', err });
    return;
  }
  ctx.body = JSON.stringify({ message: '初始化数据库成功' });
});

module.exports = router.routes();
