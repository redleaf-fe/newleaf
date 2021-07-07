const Router = require('koa-router');

const { hasAppAccess } = require('../services');

const router = new Router();

// 创建/编辑原型
router.post('/saveProto', async (ctx) => {
  const { stage, id, businessId, type } = ctx.request.body;

  if (
    !(await hasAppAccess({
      ctx,
      id: businessId,
      user_id: ctx.gitUid,
      type,
    }))
  ) {
    ctx.body = { message: '没有操作权限' };
    return;
  }

  if (!businessId || !type) {
    ctx.body = { message: '业务参数必填' };
    return;
  }

  const businessMap = {
    app: {
      model: ctx.conn.models.app,
      filter: { gitId: businessId },
    },
  };

  if (!Array.isArray(stage)) {
    ctx.body = { message: '格式不正确' };
    return;
  }
  if (stage.some((v) => !Array.isArray(v))) {
    ctx.body = { message: '格式不正确' };
    return;
  }

  const stageArr = stage;
  if (stageArr.length < 2) {
    ctx.body = { message: '审批环节最少2个' };
    return;
  } else if (stageArr.length > 10) {
    ctx.body = { message: '审批环节最多10个' };
    return;
  }

  if (stageArr.some((v) => v.length < 1)) {
    ctx.body = { message: '每个环节最少1个审批人' };
    return;
  } else if (stageArr.some((v) => v.length > 5)) {
    ctx.body = { message: '每个环节最多5个审批人' };
    return;
  }

  // 编辑
  if (id) {
    await ctx.conn.models.approveProto.update(
      {
        stage: JSON.stringify(stage),
      },
      {
        where: {
          id,
        },
      }
    );

    ctx.body = { message: '保存成功' };
  } else {
    // 创建
    const res = await ctx.conn.models.approveProto.create({
      stage: JSON.stringify(stage),
    });

    const res2 = await businessMap[type].model.findOne({
      where: businessMap[type].filter,
    });
    
    if (res2.apId) {
      ctx.body = { message: '业务对象上已绑定原型' };
      return;
    }

    await businessMap[type].model.update(
      {
        apId: res.id,
      },
      {
        where: businessMap[type].filter,
      }
    );

    ctx.body = { message: '创建成功' };
  }
});

// 查询
router.get('/getProto', async (ctx) => {
  const { businessId, type } = ctx.request.query;

  if (!businessId || !type) {
    ctx.body = { message: '业务参数必填' };
    return;
  }

  const businessMap = {
    app: {
      model: ctx.conn.models.app,
      idKey: 'gitId',
    },
  };

  const res = await businessMap[type].model.findOne({
    where: {
      [businessMap[type].idKey]: businessId,
    },
  });

  if (!res.apId) {
    ctx.body = { message: '未找到关联的业务对象' };
    return;
  }

  const res2 = await ctx.conn.models.approveProto.findOne({
    where: { id: res.apId },
  });

  ctx.body = res2;
});

module.exports = router.routes();
