const Router = require('koa-router');
const Schema = require('validate');

const { findRepeat, namespaceHasAccess } = require('../services');
const { validate, searchAndPage } = require('../utils');

const router = new Router();

const schema = new Schema({
  name: {
    type: String,
    required: true,
    length: { min: 4, max: 100 },
    match: /^[a-zA-Z0-9_]+$/,
    message: {
      required: '分组名称必填',
      length: '分组名称不大于100字符',
      match: '分组名称只支持数字、英文、和_',
    },
  },
});

router.get('/list', async (ctx) => {
  const { currentPage = 1, pageSize = 10, name } = ctx.request.query;

  let res;
  res = await ctx.codeRepo.getUserGroups({ id: ctx.gitUid });
  const param = {
    data: res.data,
    currentPage,
    pageSize,
  };
  if (name) {
    param.search = name;
    param.searchKey = 'source_name';
  }
  res = searchAndPage(param);

  await Promise.all(
    (res.data || []).map(async (v) => {
      const res2 = await ctx.conn.models.group.findOne({
        attributes: ['updater', 'updatedAt'],
        where: { gitId: v.source_id },
      });
      v.updater = res2.updater;
      v.updatedAt = res2.updatedAt;
    })
  );

  ctx.body = {
    count: res.total,
    rows: res.data || [],
  };
});

router.get('/detail', async (ctx) => {
  const { id = '' } = ctx.request.query;

  if (!id) {
    ctx.body = { message: 'id必填' };
    return;
  }

  const res = await ctx.codeRepo.getGroupDetail({ id });
  ctx.body = res.data;
});

router.post('/save', async (ctx) => {
  const { name, description, id } = ctx.request.body;

  if (!validate({ ctx, schema, obj: { name } })) {
    return;
  }

  // 编辑
  if (id) {
    await ctx.codeRepo.updateGroup({ id, name, description });

    await ctx.conn.models.group.update(
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
        modelName: 'group',
        queryKey: ['name'],
        queryObj: { name },
        repeatMsg: '分组名称已被使用',
      })
    ) {
      return;
    }

    // 创建
    const res = await ctx.codeRepo.createGroup({ name, description });

    await ctx.codeRepo.addUserToGroup({
      id: res.data.id,
      user_id: ctx.gitUid,
      access_level: 40,
    });

    await ctx.conn.models.group.create({
      name,
      gitId: res.data.id,
      creator: ctx.username,
      updater: ctx.username,
    });

    ctx.body = { message: '创建成功' };
  }
});

// 分组中的应用操作
router.get('/getAppInGroup', async (ctx) => {
  const { id = '', currentPage = 1, pageSize = 10, name } = ctx.request.query;

  if (!id) {
    ctx.body = { message: 'id必填' };
    return;
  }

  let res;
  res = await ctx.codeRepo.getGroupProjects({ id });
  const param = {
    data: res.data,
    currentPage,
    pageSize,
  };
  if (name) {
    param.search = name;
    param.searchKey = 'name';
  }
  res = searchAndPage(param);

  ctx.body = {
    count: res.total,
    rows: res.data,
  };
});

router.post('/shareAppWithGroup', async (ctx) => {
  const { id, group_id } = ctx.request.body;

  if (!id || !group_id) {
    ctx.body = { message: 'id必填' };
    return;
  }

  await ctx.codeRepo.shareProjectWithGroup({
    id,
    group_id,
    group_access: 40,
  });
  ctx.body = { message: '操作成功' };
});

router.post('/delShareAppWithGroup', async (ctx) => {
  const { id, group_id } = ctx.request.body;

  if (!id || !group_id) {
    ctx.body = { message: 'id必填' };
    return;
  }

  if (
    !(await namespaceHasAccess({
      ctx,
      id: group_id,
      user_id: ctx.gitUid,
      type: 'group',
    }))
  ) {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  await ctx.codeRepo.delShareProjectWithGroup({
    id,
    group_id,
  });
  ctx.body = { message: '操作成功' };
});

module.exports = router.routes();
