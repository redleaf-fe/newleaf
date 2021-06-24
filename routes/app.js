const Router = require('koa-router');
const Schema = require('validate');

const { findRepeat } = require('../services');
const { validate, searchAndPage } = require('../utils');
const { maxPageSize } = require('../const');

const router = new Router();

const schema = new Schema({
  name: {
    type: String,
    required: true,
    length: { max: 20 },
    match: /^[a-zA-Z0-9-]+$/,
    message: {
      required: '应用名称必填',
      length: '应用名称不大于20字符',
      match: '应用名称只支持数字、英文、和-',
    },
  },
});

router.get('/list', async (ctx) => {
  const { currentPage = 1, pageSize = 10, name } = ctx.request.query;
  let res;
  if (name) {
    res = await ctx.codeRepo.getUserProjects({
      id: ctx.gitUid,
      page: 1,
      per_page: maxPageSize,
    });
    res = searchAndPage({
      data: res.data,
      currentPage,
      pageSize,
      search: name,
      searchKey: 'source_name',
    });
  } else {
    res = await ctx.codeRepo.getUserProjects({
      id: ctx.gitUid,
      page: currentPage,
      per_page: pageSize,
    });
  }

  await Promise.all(
    res.data.map(async (v) => {
      const res2 = await ctx.conn.models.app.findOne({
        attributes: ['updater', 'updatedAt'],
        where: { gitId: v.source_id },
      });
      v.updater = res2.updater;
      v.updatedAt = res2.updatedAt;
    })
  );

  ctx.body = {
    count: res.total,
    rows: res.data,
  };
});

router.get('/detail', async (ctx) => {
  const { id = '' } = ctx.request.query;

  if (!id) {
    ctx.body = { message: 'id必填' };
    return;
  }

  const res = await ctx.codeRepo.getProjectDetail({ id });
  ctx.body = res.data;
});

router.post('/save', async (ctx) => {
  const { name, description, id } = ctx.request.body;

  if (!validate({ ctx, schema, obj: { name } })) {
    return;
  }

  // 编辑
  if (id) {
    await ctx.codeRepo.updateProject({ id, name, description });

    await ctx.conn.models.app.update(
      {
        name,
        creator: ctx.username,
        updater: ctx.username,
      },
      {
        where: {
          gitId: id,
        },
      }
    );

    ctx.body = { message: '保存成功' };
  } else {
    if (
      await findRepeat({
        ctx,
        modelName: 'app',
        queryKey: ['name'],
        queryObj: { name },
        repeatMsg: '应用名已被使用',
      })
    ) {
      return;
    }

    // 创建
    const res = await ctx.codeRepo.createProject({ name, description });

    await ctx.codeRepo.addUserToProject({
      id: res.data.id,
      user_id: ctx.gitUid,
      access_level: 40,
    });

    await ctx.conn.models.app.create({
      name,
      gitId: res.data.id,
      creator: ctx.username,
      updater: ctx.username,
    });

    ctx.body = { message: '创建成功' };
  }
});

module.exports = router.routes();
