const Router = require('koa-router');
const Schema = require('validate');

const { idGenerate, createUniq } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const schema = new Schema({
  name: {
    type: String,
    required: true,
    length: { max: 20 },
    match: /^[a-zA-Z0-9-]+$/,
    message: {
      required: '分组名称必填',
      length: '分组名称不大于20字符',
      match: '分组名称只支持数字、英文、和-',
    },
  },
});

router.get('/list', async (ctx) => {
  const { groupName = '', currentPage = 1, pageSize = 10 } = ctx.request.query;
  res = await ctx.codeRepo.getUserGroups({ search: groupName, id: ctx.gitUid, page: currentPage, per_page: pageSize });

  ctx.body = {
    count: res.data.length,
    rows: res.data,
  };
});

router.get('/detail', async (ctx) => {
  const { id = '' } = ctx.request.query;

  const res = await ctx.conn.models.app.findOne({
    attributes: ['appName', 'desc', 'git'],
    where: { id },
  });

  ctx.body = res || { message: '未找到应用' };
});

router.post('/save', async (ctx) => {
  const { name, description, id } = ctx.request.body;

  if (!validate({ ctx, schema, obj: { name } })) {
    return;
  }

  // 编辑
  if (id) {
    // const res = await ctx.conn.models.app.findOne({
    //   attributes: ['id'],
    //   where: { id },
    // });
    // if (res) {
    //   await ctx.conn.models.app.update(
    //     {
    //       appName,
    //       desc,
    //       updater: ctx.uid,
    //       git,
    //     },
    //     {
    //       where: { id },
    //     }
    //   );
    //   ctx.body = { message: '保存成功' };
    // } else {
    //   ctx.status = 400;
    //   ctx.body = { message: '未找到应用' };
    // }
  } else {
    // 创建
    await ctx.codeRepo.createGroup({ name, description });

    ctx.body = { message: '创建成功' };
  }
});

module.exports = router.routes();
