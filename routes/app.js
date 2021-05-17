const Router = require('koa-router');
const { idGenerate, createUniq } = require('../services');

const router = new Router();

router.get('/list', async (ctx) => {
  // todo: 搜索条件
  // const { user } = ctx.request.query;
  const res = await ctx.conn.models.user.findAll({
    attributes: ['appList'],
    where: { uid: ctx.uid },
  });
  ctx.body = JSON.stringify(res);
});

router.get('/save', async (ctx) => {
  const { appName, git, desc, id } = ctx.request.body;

  // 编辑
  if (id) {
    const res = await ctx.conn.models.appList.findAll({
      attributes: ['id'],
      where: { id },
    });

    if (res.length > 0) {
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
      
      ctx.body = JSON.stringify({ message: '保存成功' });
    } else {
      ctx.status = 400;
      ctx.body = JSON.stringify({ message: '未找到应用' });
    }
  } else {
    // 创建
    const appId = await idGenerate({
      ctx,
      modelName: 'appList',
    });

    if (
      await createUniq({
        ctx,
        modelName: 'appList',
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
      ctx.body = JSON.stringify({ message: '创建成功' });
    }
  }
});

module.exports = router.routes();
