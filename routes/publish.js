const Router = require('koa-router');
const Schema = require('validate');
const { Op } = require('sequelize');

const { validate } = require('../utils');
const { envMap } = require('../const');

const router = new Router();

const schema = new Schema({
  appId: {
    required: true,
    length: { max: 20 },
    message: {
      required: '应用Id必填',
      length: '应用Id不大于20字符',
    },
  },
  appName: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '应用名称必填',
      length: '应用名称不大于100字符',
    },
  },
  commit: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '分支名必填',
      length: '分支名不大于100字符',
    },
  },
});

router.get('/list', async (ctx) => {
  const { appId, env, currentPage = 1, pageSize = 10 } = ctx.request.query;

  if (!appId) {
    ctx.status = 400;
    ctx.body = { message: '应用id必填' };
    return;
  }

  const filter = {
    [Op.and]: [
      {
        appId,
        env
      },
    ],
  };

  const publish = await ctx.conn.models.publish.findAndCountAll({
    offset: pageSize * (currentPage - 1),
    limit: Number(pageSize),
    where: filter,
    order: ['updatedAt'],
  });

  ctx.body = publish;
});

router.get('/approve', async (ctx) => {
  // const { id = '' } = ctx.request.query;
  // const res = await ctx.conn.models.app.findOne({
  //   attributes: ['name', 'desc', 'git'],
  //   where: { id },
  // });
  // ctx.status = 400;
  // ctx.body = res || { message: '未找到应用' };
});

router.post('/save', async (ctx) => {
  const { appId, appName, desc, commit, env } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { appId, appName, commit } })) {
    return;
  }

  let approveInsId;

  if (env === envMap.prod) {
    const res = await ctx.conn.models.app.findOne({
      where: { gitId: appId },
    });

    if (!res.apId) {
      ctx.status = 400;
      ctx.body = { message: '获取应用审核环节失败' };
      return;
    }

    // 创建审批实例
    const res2 = await ctx.conn.models.approveIns.create({
      stageId: 0,
      status: 'pending',
      apId: res.apId,
    });

    if (!res2.id) {
      ctx.status = 400;
      ctx.body = { message: '创建审核实例失败' };
      return;
    }

    approveInsId = res2.id;
  }

  const param = {
    appId,
    appName,
    desc,
    commit,
    creatorId: ctx.uid,
    creator: ctx.username,
    env,
  };

  if (approveInsId) {
    param.aId = approveInsId;
  }

  await ctx.conn.models.publish.create(param);
  ctx.body = { message: '创建成功' };
});

module.exports = router.routes();
