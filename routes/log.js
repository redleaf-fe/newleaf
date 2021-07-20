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

  try {
    const res = await axios({
      url: `${config.logServer}/get`,
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
      params: { appId, ...ctx.request.query },
    });

    ctx.body = res.data;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { message: e.response.data.message };
  }
});

module.exports = router.routes();
