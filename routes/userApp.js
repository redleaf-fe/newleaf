const Router = require('koa-router');
const Schema = require('validate');
const { Op } = require('sequelize');

const { idGenerate, createUniq } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const schema = new Schema({
  data: [
    {
      uid: {
        required: true,
      },
      userName: {
        required: true,
      },
      appId: {
        required: true,
      },
      appName: {
        required: true,
      },
      auth: {
        enum: ['admin', 'develop', 'view'],
        required: true,
      },
    },
  ],
});

router.get('/list', async (ctx) => {
  const { id, currentPage = 1, pageSize = 10 } = ctx.request.query;

  if (id) {
    const res = await ctx.conn.models.userApp.findAndCountAll({
      attributes: ['uid', 'userName', 'auth'],
      where: { appId: id },
      offset: pageSize * (currentPage - 1),
      limit: Number(pageSize),
    });

    ctx.body = res;
  } else {
    ctx.body = { message: 'id必填' };
  }
});

router.post('/delete', async (ctx) => {
  const { appId, uid } = ctx.request.body;

  // 不能操作自己的权限状态
  if (uid === ctx.uid) {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  const opAuth = await ctx.conn.models.userApp.findOne({
    attributes: ['auth'],
    where: {
      uid: ctx.uid,
      appId,
    },
  });

  // 非管理员不能操作
  if (opAuth.auth !== 'admin') {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  await ctx.conn.models.userApp.destroy({
    where: {
      uid,
      appId,
    },
  });

  ctx.body = { message: '删除成功' };
});

router.post('/save', async (ctx) => {
  if (!Array.isArray(ctx.request.body)) {
    ctx.body = { message: '只接收数组' };
    return;
  }

  if (!validate({ ctx, schema, obj: { data: ctx.request.body } })) {
    return;
  }

  // 这里假定都是操作一个应用而且都是一个用户操作的（请求是new-client页面发送），如果不是这些判断要放到循环里去
  const { appId, appName } = ctx.request.body[0];

  const opAuth = await ctx.conn.models.userApp.findOne({
    attributes: ['auth'],
    where: {
      uid: ctx.uid,
      appId,
    },
  });
  // 非管理员不能操作
  if (opAuth.auth !== 'admin') {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  await Promise.all(
    ctx.request.body.map(async (v) => {
      const { uid, userName, auth } = v;

      // 不能操作自己的权限状态
      if (uid === ctx.uid) {
        return Promise.resolve(1);
      }

      const findRes = await ctx.conn.models.userApp.findOne({
        attributes: ['uid', 'appId', 'auth'],
        where: {
          uid,
          appId,
        },
      });

      if (findRes) {
        await ctx.conn.models.userApp.update(
          {
            auth,
          },
          {
            where: {
              uid,
              appId,
            },
          }
        );
      } else {
        // appName和userName直接从请求中读取，如果要求严格，可以根据id从对应表中读取
        await ctx.conn.models.userApp.create({
          appId,
          appName,
          uid,
          userName,
          auth,
        });
      }
    })
  );

  ctx.body = { message: '操作成功' };
});

module.exports = router.routes();
