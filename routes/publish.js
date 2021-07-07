const Router = require('koa-router');
const Schema = require('validate');
const { Op } = require('sequelize');

const { validate } = require('../utils');

const router = new Router();

const schema = new Schema({
  name: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '发布名称必填',
      length: '发布名称不大于100字符',
    },
  },
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
  branch: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '分支名必填',
      length: '分支名不大于100字符',
    },
  },
  commitId: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '提交Id必填',
      length: '提交Id不大于100字符',
    },
  },
});

router.get('/list', async (ctx) => {
  const { appId, name, currentPage = 1, pageSize = 10 } = ctx.request.query;

  if (!appId) {
    ctx.body = { message: '应用id必填' };
    return;
  }

  const filter = {
    [Op.and]: [
      {
        appId,
      },
    ],
  };

  if (name) {
    filter[Op.and].push({ name: { [Op.like]: `%${name}%` } });
  }

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
  // ctx.body = res || { message: '未找到应用' };
});

router.post('/save', async (ctx) => {
  const { name, appId, appName, desc, branch, commitId } = ctx.request.body;
  // 允许发布同名
  if (
    !validate({ ctx, schema, obj: { name, appId, appName, branch, commitId } })
  ) {
    return;
  }

  const res = await ctx.conn.models.app.findOne({
    where: { gitId: appId },
  });

  if (!res.apId) {
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
    ctx.body = { message: '创建审核实例失败' };
    return;
  }
  await ctx.conn.models.publish.create({
    name,
    appId,
    appName,
    desc,
    branch,
    commitId,
    creatorId: ctx.uid,
    creator: ctx.username,
    env: 'daily',
    aId: res2.id,
  });
  ctx.body = { message: '创建成功' };
});

module.exports = router.routes();
