const Router = require('koa-router');
const Schema = require('validate');
const axios = require('axios');
const config = require('../env.json');

const { validate } = require('../utils');

const router = new Router();

const schema = new Schema({
  appName: {
    type: String,
    required: true,
    message: {
      required: '参数中缺少应用名称',
    },
  },
  currentPage: {
    type: String,
  },
  datetime: {
    type: String,
  },
});

router.get('/get', async (ctx) => {
  const { query } = ctx.request;

  if (!validate({ ctx, schema, obj: query })) {
    return;
  }

  const res = await ctx.conn.models.appList.findAll({
    attributes: ['id'],
    where: { appName: query.appName },
  });

  if (res[0]) {
    const res2 = await axios({
      url: config.logSeverPath,
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
      params: { appId: res[0].id, ...query },
    });

    ctx.body = res2.data;
  } else {
    ctx.body = JSON.stringify({ message: '未找到应用' });
  }
});

module.exports = router.routes();
