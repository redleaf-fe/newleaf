const Router = require('koa-router');
const Schema = require('validate');
const axios = require('axios');
const config = require('../env.json');

const { validate } = require('../utils');

const router = new Router();

router.get('/get', async (ctx) => {
  const { query } = ctx.request;

  const res = await axios({
    url: config.logSeverPath,
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
    params: query || {},
  });

  const { errCode } = res.data || {};

  if (errCode) {
    ctx.body = JSON.stringify([]);
  } else {
    console.log(res.data);
    ctx.body = res.data;
  }
});

module.exports = router.routes();
