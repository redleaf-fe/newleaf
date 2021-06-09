const Router = require('koa-router');
const Schema = require('validate');

const { idGenerate, createUniq } = require('../services');
const { validate } = require('../utils');

const router = new Router();

// 应用名和git地址只支持英文
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

const getAppList = async (ctx, next) => {
  ctx.appListRes = await ctx.conn.models.user.findOne({
    attributes: ['appList'],
    where: { uid: ctx.uid },
  });
  await next();
};

router.get('/list', getAppList, async (ctx) => {
  // todo: 搜索条件
  if (ctx.appListRes) {
    // 查找appList表获取详情
    const res = await ctx.conn.models.appList.findAll({
      attributes: ['appName', 'git', 'updatedAt', 'id'],
      where: {
        id: Object.values(JSON.parse(ctx.appListRes.appList)).map((v) => v.id),
      },
    });
    ctx.body = res;
  } else {
    ctx.body = { message: '未找到用户' };
  }
});

router.get('/detail', async (ctx) => {
  const { id = '' } = ctx.request.query;

  const res = await ctx.conn.models.appList.findOne({
    attributes: ['appName', 'desc', 'git'],
    where: { id },
  });

  ctx.body = res || { message: '未找到应用' };
});

router.post('/delete', getAppList, async (ctx) => {
  const { id = '' } = ctx.request.body;

  if (id) {
    // 删除所有user记录中包含的该app的信息
    await ctx.conn.models.user.update(
      {
        appList: ctx.appListRes.appList
          ? JSON.stringify(
              JSON.parse(ctx.appListRes.appList).concat({
                id: appId,
                auth: 'admin',
              })
            )
          : JSON.stringify([{ id: appId, auth: 'admin' }]),
      },
      {
        where: { uid: ctx.uid },
      }
    );

    // todo: 删除相关日志和发布记录，文件等
    // await ctx.conn.models.appList.destroy({
    //   where: { id },
    // });

    ctx.body = { message: '删除成功' };
  }

  ctx.body = { message: '应用id必填' };
});

router.post('/save', getAppList, async (ctx) => {
  const { appName, git, desc, id } = ctx.request.body;

  if (!validate({ ctx, schema, obj: { appName, git } })) {
    return;
  }

  // 编辑
  if (id) {
    const res = await ctx.conn.models.appList.findOne({
      attributes: ['id'],
      where: { id },
    });

    if (res) {
      await ctx.conn.models.appList.update(
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
      // 在用户表的appList字段中添加新创建的应用
      await ctx.conn.models.user.update(
        {
          // appList为空，不进行拼接
          appList: ctx.appListRes.appList
            ? JSON.stringify(
                JSON.parse(ctx.appListRes.appList).concat({
                  id: appId,
                  auth: 'admin',
                })
              )
            : JSON.stringify([{ id: appId, auth: 'admin' }]),
        },
        {
          where: { uid: ctx.uid },
        }
      );
      ctx.body = { message: '创建成功' };
    }
  }
});

module.exports = router.routes();
