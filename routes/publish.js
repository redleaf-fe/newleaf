const Router = require('koa-router');
const Schema = require('validate');
const { Op } = require('sequelize');

const { idGenerate, createUniq } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const schema = new Schema({
  appName: {
    type: String,
    required: true,
    length: { max: 20 },
    message: {
      required: '发布名称必填',
      length: '发布名称不大于20字符',
    },
  },
});

router.get('/list', async (ctx) => {
  const {
    appId,
    publishName,
    currentPage = 1,
    pageSize = 10,
  } = ctx.request.query;

  if (!appId) {
    ctx.body = { message: '应用id必填' };
    return;
  }

  const filter = {
    [Op.and]: [
      {
        appId,
      },
    ],
  };

  if (publishName) {
    filter[Op.and].push({ name: { [Op.like]: `%${publishName}%` } });
  }

  const publish = await ctx.conn.models.appPublish.findAndCountAll({
    offset: pageSize * (currentPage - 1),
    limit: Number(pageSize),
    where: filter,
    order: ['updatedAt'],
  });

  ctx.body = publish;
});

router.get('/detail', async (ctx) => {
  const { id = '' } = ctx.request.query;

  const res = await ctx.conn.models.app.findOne({
    attributes: ['name', 'desc', 'git'],
    where: { id },
  });

  ctx.body = res || { message: '未找到应用' };
});

router.post('/save', async (ctx) => {
  const { appName, git, desc, id } = ctx.request.body;

  if (!validate({ ctx, schema, obj: { appName } })) {
    return;
  }

  // 编辑
  if (id) {
    const res = await ctx.conn.models.app.findOne({
      attributes: ['id'],
      where: { id },
    });

    if (res) {
      await ctx.conn.models.app.update(
        {
          name: appName,
          desc,
          updater: ctx.uid,
          git,
        },
        {
          where: { id },
        }
      );

      ctx.body = { message: '保存成功' };
    } else {
      ctx.status = 400;
      ctx.body = { message: '未找到应用' };
    }
  } else {
    // 创建
    const appId = await idGenerate({
      ctx,
      modelName: 'app',
      idName: 'id',
    });

    if (
      await createUniq({
        ctx,
        modelName: 'app',
        queryKey: ['appName'],
        queryObj: { appName },
        repeatMsg: '应用名称已被使用',
        createObj: {
          appName,
          id: appId,
          desc,
          creator: ctx.uid,
          updater: ctx.uid,
          git,
        },
      })
    ) {
      const res = await ctx.conn.models.user.findOne({
        attributes: ['username'],
        where: { uid: ctx.uid },
      });

      await ctx.conn.models.userApp.create({
        uid: ctx.uid,
        username: res.username,
        appId,
        appName,
        auth: 'admin',
      });
      ctx.body = { message: '创建成功' };
    }
  }
});

module.exports = router.routes();
