const Router = require('koa-router');
const axios = require('axios');
const config = require('../env.json');

const router = new Router();

router.get('/get', async (ctx) => {
  const { appId } = ctx.request.query;

  if (!appId) {
    ctx.status = 400;
    ctx.body = { message: '应用id必填' };
    return;
  }

  const res = await axios({
    url: `${config.logSever}/get`,
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
    params: { appId, ...ctx.request.query },
  });

  ctx.body = res.data;
});

module.exports = router.routes();
