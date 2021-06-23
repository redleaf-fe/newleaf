const Router = require('koa-router');

const router = new Router();

router.get('/list', async (ctx) => {
  const { id, name, currentPage = 1, pageSize = 10 } = ctx.request.query;

  if (id) {
    const res = await ctx.codeRepo.getGroupMembers({
      id,
      page: currentPage,
      per_page: pageSize,
      search: name,
    });

    ctx.body = {
      count: res.total,
      rows: res.data,
    };
  } else {
    ctx.body = { message: 'id必填' };
  }
});

router.post('/delete', async (ctx) => {
  const { gitUid, groupId } = ctx.request.body;

  await ctx.codeRepo.removeUserFromGroup({
    group_id: groupId,
    user_id: gitUid,
  });

  ctx.body = { message: '删除成功' };
});

router.post('/save', async (ctx) => {
  const { uid, gitUid, groupId, access } = ctx.request.body;

  if (uid) {
    // 创建
    const res = await ctx.conn.models.user.findOne({
      attributes: ['gitUid'],
      where: { uid },
    });

    await ctx.codeRepo.addUserIntoGroup({
      group_id: groupId,
      user_id: res.gitUid,
      access_level: access || 30,
    });
    ctx.body = { message: '操作成功' };
  } else if (gitUid) {
    // 编辑
    await ctx.codeRepo.editUserInGroup({
      group_id: groupId,
      user_id: gitUid,
      access_level: access || 30,
    });

    ctx.body = { message: '操作成功' };
  } else {
    ctx.body = { message: '用户id必填' };
  }
});

module.exports = router.routes();
