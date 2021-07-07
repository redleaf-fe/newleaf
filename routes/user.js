const Router = require('koa-router');
const { Op } = require('sequelize');
const { searchAndPage } = require('../utils');
const { namespaceHasAccess } = require('../services');

const router = new Router();

router.get('/getByName', async (ctx) => {
  const { username } = ctx.request.query;

  if (username) {
    const res = await ctx.conn.models.user.findAll({
      attributes: ['uid', 'username'],
      where: { username: { [Op.like]: `%${username}%` } },
      order: ['username'],
    });
    ctx.body = res;
  } else {
    ctx.body = { message: 'username必填' };
  }
});

router.post('/removeUserFromNamespace', async (ctx) => {
  const { gitUid, id, type } = ctx.request.body;

  const reqMap = {
    group: ctx.codeRepo.removeUserFromGroup,
    app: ctx.codeRepo.removeUserFromProject,
  };

  if (
    !(await namespaceHasAccess({
      ctx,
      id,
      user_id: gitUid,
      type,
      validateSelf: true,
    }))
  ) {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  await reqMap[type]({
    id,
    user_id: gitUid,
  });

  ctx.body = { message: '删除成功' };
});

router.post('/saveUserToNamespace', async (ctx) => {
  const { uid, gitUid, id, access, type } = ctx.request.body;

  if (uid) {
    // 创建
    const res = await ctx.conn.models.user.findOne({
      attributes: ['gitUid'],
      where: { uid },
    });

    if (
      !(await namespaceHasAccess({
        ctx,
        id,
        user_id: res.gitUid,
        type,
        validateSelf: true,
      }))
    ) {
      ctx.body = { message: '没有操作权限' };
      return;
    }

    const reqMap = {
      group: ctx.codeRepo.addUserToGroup,
      app: ctx.codeRepo.addUserToProject,
    };

    await reqMap[type]({
      id,
      user_id: res.gitUid,
      access_level: access || 30,
    });
    ctx.body = { message: '操作成功' };
  } else if (gitUid) {
    if (
      !(await namespaceHasAccess({
        ctx,
        id,
        user_id: gitUid,
        type,
        validateSelf: true,
      }))
    ) {
      ctx.body = { message: '没有操作权限' };
      return;
    }

    const reqMap = {
      group: ctx.codeRepo.editUserInGroup,
      app: ctx.codeRepo.editUserInProject,
    };

    // 编辑
    await reqMap[type]({
      id,
      user_id: gitUid,
      access_level: access || 30,
    });

    ctx.body = { message: '操作成功' };
  } else {
    ctx.body = { message: '用户id必填' };
  }
});

// 分组中的成员列表
router.get('/getMembersInNamespace', async (ctx) => {
  const { id, name, currentPage = 1, pageSize = 10, type } = ctx.request.query;

  const reqMap = {
    group: ctx.codeRepo.getGroupMembers,
    app: ctx.codeRepo.getProjectMembers,
  };

  if (id) {
    let res;

    res = await reqMap[type]({ id });
    // 过滤掉root
    res.data = res.data.filter((v) => v.username !== 'root');
    const param = {
      data: res.data,
      currentPage,
      pageSize,
    };
    if (name) {
      param.search = name;
      param.searchKey = 'username';
    }
    res = searchAndPage(param);

    ctx.body = {
      count: res.total - 1,
      rows: res.data,
    };
  } else {
    ctx.body = { message: 'id必填' };
  }
});

module.exports = router.routes();
