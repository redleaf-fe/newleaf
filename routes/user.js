const Router = require('koa-router');
const { Op } = require('sequelize');
const { searchAndPage } = require('../utils');
const { hasAppAccess } = require('../services');

const router = new Router();

router.get('/getByName', async (ctx) => {
  const { username } = ctx.request.query;

  if (username) {
    const res = await ctx.seq.models.user.findAll({
      attributes: ['uid', 'username'],
      where: { username: { [Op.like]: `%${username}%` } },
      order: ['username'],
    });
    ctx.body = res;
  } else {
    ctx.status = 400;
    ctx.body = { message: 'username必填' };
  }
});

router.post('/removeUserFromApp', async (ctx) => {
  const { gitUid, id } = ctx.request.body;

  if (
    !(await hasAppAccess({
      ctx,
      id,
      user_id: gitUid,
      validateSelf: true,
    }))
  ) {
    ctx.status = 400;
    ctx.body = { message: '没有操作权限' };
    return;
  }

  await ctx.codeRepo.removeUserFromProject({
    id,
    user_id: gitUid,
  });

  await ctx.seq.models.userApp.destroy({
    where: {
      gitUid,
      appId: id,
    },
  });

  ctx.body = { message: '删除成功' };
});

router.post('/saveUserToApp', async (ctx) => {
  const { uid, gitUid, name, id, access } = ctx.request.body;

  if (uid) {
    // 创建
    const res = await ctx.seq.models.user.findOne({
      attributes: ['gitUid', 'username'],
      where: { uid },
    });

    if (
      !(await hasAppAccess({
        ctx,
        id,
        user_id: res.gitUid,
        validateSelf: true,
      }))
    ) {
      ctx.status = 400;
      ctx.body = { message: '没有操作权限' };
      return;
    }

    await ctx.codeRepo.addUserToProject({
      id,
      user_id: res.gitUid,
      access_level: access || 30,
    });

    await ctx.seq.models.userApp.create({
      gitUid: res.gitUid,
      username: res.username,
      appName: name,
      appId: id,
      auth: 30,
    });

    ctx.body = { message: '操作成功' };
  } else if (gitUid) {
    if (
      !(await hasAppAccess({
        ctx,
        id,
        user_id: gitUid,
        validateSelf: true,
      }))
    ) {
      ctx.status = 400;
      ctx.body = { message: '没有操作权限' };
      return;
    }

    // 编辑
    await ctx.codeRepo.editUserInProject({
      id,
      user_id: gitUid,
      access_level: access || 30,
    });

    await ctx.seq.models.userApp.update(
      {
        auth: access || 30,
      },
      {
        where: {
          gitUid,
          appId: id,
        },
      }
    );

    ctx.body = { message: '操作成功' };
  } else {
    ctx.status = 400;
    ctx.body = { message: '用户id必填' };
  }
});

// 成员列表
router.get('/getMembersInApp', async (ctx) => {
  const { id, name, currentPage = 1, pageSize = 10 } = ctx.request.query;

  if (id) {
    let res;

    res = await ctx.codeRepo.getProjectMembers({ id });
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

    ctx.body = searchAndPage(param);
  } else {
    ctx.status = 400;
    ctx.body = { message: 'id必填' };
  }
});

module.exports = router.routes();
