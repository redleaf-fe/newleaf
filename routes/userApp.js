const Router = require('koa-router');
const { searchAndPage } = require('../utils');
const { maxPageSize } = require('../const');

const router = new Router();

router.get('/list', async (ctx) => {
  const { id, name, currentPage = 1, pageSize = 10 } = ctx.request.query;
  if (id) {
    let res;
    if (name) {
      res = await ctx.codeRepo.getProjectMembers({
        id,
        page: 1,
        per_page: maxPageSize,
      });
      // 过滤掉root
      res.data = res.data.filter((v) => v.username !== 'root');
      res = searchAndPage({
        data: res.data,
        currentPage,
        pageSize,
        search: name,
        searchKey: 'username',
      });
    } else {
      res = await ctx.codeRepo.getProjectMembers({
        id,
        page: currentPage,
        per_page: pageSize,
      });
      // 过滤掉root
      res.data = res.data.filter((v) => v.username !== 'root');
    }

    ctx.body = {
      count: res.total - 1,
      rows: res.data,
    };
  } else {
    ctx.body = { message: 'id必填' };
  }
});

async function hasAccess({ ctx, id, user_id }) {
  const res = await ctx.codeRepo.getUserOfProject({ id, user_id });

  if (res.access_level < 40) {
    return false;
  }

  // 不能操作自己
  if (+ctx.gitUid === +user_id) {
    return false;
  }

  return true;
}

router.post('/delete', async (ctx) => {
  const { gitUid, id } = ctx.request.body;

  if (!(await hasAccess({ ctx, id, user_id: gitUid }))) {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  await ctx.codeRepo.removeUserFromProject({
    id,
    user_id: gitUid,
  });

  ctx.body = { message: '删除成功' };
});

router.post('/save', async (ctx) => {
  const { uid, gitUid, id, access } = ctx.request.body;

  if (uid) {
    // 创建
    const res = await ctx.conn.models.user.findOne({
      attributes: ['gitUid'],
      where: { uid },
    });

    if (!(await hasAccess({ ctx, id, user_id: res.gitUid }))) {
      ctx.body = { message: '没有操作权限' };
      return;
    }

    await ctx.codeRepo.addUserIntoProject({
      id,
      user_id: res.gitUid,
      access_level: access || 30,
    });
    ctx.body = { message: '操作成功' };
  } else if (gitUid) {
    if (!(await hasAccess({ ctx, id, user_id: gitUid }))) {
      ctx.body = { message: '没有操作权限' };
      return;
    }

    // 编辑
    await ctx.codeRepo.editUserInProject({
      id,
      user_id: gitUid,
      access_level: access || 30,
    });

    ctx.body = { message: '操作成功' };
  } else {
    ctx.body = { message: '用户id必填' };
  }
});

module.exports = router.routes();
