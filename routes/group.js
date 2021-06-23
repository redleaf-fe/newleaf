const Router = require('koa-router');
const Schema = require('validate');

const { findRepeat } = require('../services');
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
  const res = await ctx.codeRepo.getUserGroups({
    search: groupName,
    id: ctx.gitUid,
    page: currentPage,
    per_page: pageSize,
  });

  await Promise.all(
    res.data.map(async (v) => {
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
    rows: res.data,
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
        groupName: name,
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
        queryKey: ['groupName'],
        queryObj: { groupName: name },
        repeatMsg: '组名已被使用',
      })
    ) {
      return;
    }

    // 创建
    const res = await ctx.codeRepo.createGroup({ name, description });

    await ctx.codeRepo.addUserIntoGroup({
      group_id: res.data.id,
      user_id: ctx.gitUid,
      access_level: 50,
    });

    await ctx.conn.models.group.create({
      groupName: name,
      gitId: res.data.id,
      creator: ctx.username,
      updater: ctx.username,
    });

    ctx.body = { message: '创建成功' };
  }
});

module.exports = router.routes();