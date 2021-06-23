const Router = require('koa-router');
const { searchAndPage } = require('../utils');
const { maxPageSize } = require('../const');

const router = new Router();

router.get('/list', async (ctx) => {
  const { id, name, currentPage = 1, pageSize = 10 } = ctx.request.query;
  if (id) {
    let res;
    if (name) {
      res = await ctx.codeRepo.getGroupMembers({
        id,
        page: 1,
        per_page: maxPageSize,
      });
      res = searchAndPage({
        data: res.data,
        currentPage,
        pageSize,
        search: name,
        searchKey: 'username',
      });
    } else {
      res = await ctx.codeRepo.getGroupMembers({
        id,
        page: currentPage,
        per_page: pageSize,
      });
    }

    ctx.body = {
      count: res.total,
      rows: res.data,
    };
  } else {
    ctx.body = { message: 'id必填' };
  }
});

async function hasAccess({ ctx, id, user_id }) {
  const res = await ctx.codeRepo.getUserOfGroup({ id, user_id });

  if (res.access_level < 50) {
    return false;
  }

  // 不能操作自己
  if (ctx.gitUid === user_id) {
    return false;
  }

  return true;
}

router.post('/delete', async (ctx) => {
  const { gitUid, groupId } = ctx.request.body;

  if (!(await hasAccess({ ctx, id: groupId, user_id: gitUid }))) {
    ctx.body = { message: '没有操作权限' };
    return;
  }

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

    if (!(await hasAccess({ ctx, id: groupId, user_id: res.gitUid }))) {
      ctx.body = { message: '没有操作权限' };
      return;
    }

    await ctx.codeRepo.addUserIntoGroup({
      group_id: groupId,
      user_id: res.gitUid,
      access_level: access || 30,
    });
    ctx.body = { message: '操作成功' };
  } else if (gitUid) {
    if (!(await hasAccess({ ctx, id: groupId, user_id: gitUid }))) {
      ctx.body = { message: '没有操作权限' };
      return;
    }

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
