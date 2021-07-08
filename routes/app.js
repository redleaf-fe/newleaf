const Router = require('koa-router');
const Schema = require('validate');
const { Op } = require('sequelize');

const { findRepeat } = require('../services');
const { validate, searchAndPage } = require('../utils');

const router = new Router();

const schema = new Schema({
  name: {
    type: String,
    required: true,
    length: { min: 4, max: 100 },
    match: /^[a-zA-Z0-9_]+$/,
    message: {
      required: '应用名称必填',
      length: '应用名称需要4到100字符之间',
      match: '只支持数字、英文、和_',
    },
  },
});

// function getUserProjects(){

// }

router.get('/list', async (ctx) => {
  const { currentPage = 1, pageSize = 10, name } = ctx.request.query;

  const filter = {
    [Op.and]: [],
  };

  if (name) {
    filter[Op.and].push({ name: { [Op.like]: `%${name}%` } });
  }

  const res = await ctx.conn.models.userApp.findAndCountAll({
    offset: pageSize * (currentPage - 1),
    limit: Number(pageSize),
    where: filter,
    order: ['createdAt'],
  });

  const ret = JSON.parse(JSON.stringify(res));
  await Promise.all(
    (ret.rows || []).map(async (v) => {
      const res2 = await ctx.conn.models.app.findOne({
        attributes: ['updater', 'updatedAt'],
        where: { gitId: v.appId },
      });
      v.updater = res2.updater;
      v.updatedAt = res2.updatedAt;
    })
  );

  ctx.body = ret;
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

    await ctx.conn.models.userApp.create({
      uid: ctx.gitUid,
      username: ctx.username,
      appName: name,
      appId: res.data.id,
      auth: 40,
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

router.get('/getByName', async (ctx) => {
  const { name } = ctx.request.query;

  if (name) {
    let res = await ctx.codeRepo.getUserProjects({ id: ctx.gitUid });
    ctx.body = res.data;
  } else {
    ctx.body = { message: 'name必填' };
  }
});

router.get('/all', async (ctx) => {
  let res = await ctx.codeRepo.getUserProjects({ id: ctx.gitUid });
  ctx.body = res.data;
});

router.get('/branch', async (ctx) => {
  const { id } = ctx.request.query;
  let res = await ctx.codeRepo.getProjectBranch({ id });
  ctx.body = res.data;
});

router.get('/commit', async (ctx) => {
  const { id, refName } = ctx.request.query;
  let res = await ctx.codeRepo.getBranchCommit({ id, ref_name: refName });
  ctx.body = res.data;
});

module.exports = router.routes();
