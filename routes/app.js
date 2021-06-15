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
    match: /^[a-zA-Z0-9-]+$/,
    message: {
      required: '应用名称必填',
      length: '应用名称不大于20字符',
      match: '应用名称只支持数字、英文、和-',
    },
  },
});

router.get('/list', async (ctx) => {
  const appIds = await ctx.conn.models.userApp.findAll({
    attributes: ['appId'],
    where: { uid: ctx.uid },
  });

  if (appIds.length > 0) {
    const { appName = '', currentPage = 1, pageSize = 10 } = ctx.request.query;
    const filter = {
      [Op.and]: [
        {
          id: appIds.map((v) => v.appId),
        },
      ],
    };

    if (appName) {
      filter[Op.and].push({ appName: { [Op.like]: `%${appName}%` } });
    }
    // 查找app表获取详情
    const res = await ctx.conn.models.app.findAndCountAll({
      attributes: ['appName', 'git', 'updatedAt', 'id'],
      where: filter,
      order: ['createdAt'],
      offset: pageSize * (currentPage - 1),
      limit: Number(pageSize),
    });
    ctx.body = res;
  } else {
    ctx.body = { rows: [], count: 0 };
  }
});

router.get('/detail', async (ctx) => {
  const { id = '' } = ctx.request.query;

  const res = await ctx.conn.models.app.findOne({
    attributes: ['appName', 'desc', 'git'],
    where: { id },
  });

  ctx.body = res || { message: '未找到应用' };
});

router.post('/delete', async (ctx) => {
  const { id = '' } = ctx.request.body;

  if (id) {
    await ctx.conn.models.userApp.destroy({
      where: { appId: id },
    });

    await ctx.conn.models.app.update(
      {
        isDeleted: true,
      },
      { where: { id } }
    );
    // todo: 删除相关日志和发布记录，文件等

    ctx.body = { message: '删除成功' };
  } else {
    ctx.body = { message: '应用id必填' };
  }
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
          appName,
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
        attributes: ['userName'],
        where: { uid: ctx.uid },
      });

      await ctx.conn.models.userApp.create({
        uid: ctx.uid,
        userName: res.userName,
        appId,
        appName,
        auth: 'admin',
      });
      ctx.body = { message: '创建成功' };
    }
  }
});

module.exports = router.routes();
