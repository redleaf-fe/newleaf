const Router = require('koa-router');

const { hasAppAccess } = require('../services');

const { approveStatusMap } = require('../const');

const router = new Router();

async function getInsNProto({ ctx, id }) {
  const resPub = await ctx.seq.models.publish.findOne({
    where: { id },
  });

  const resIns = await ctx.seq.models.approveIns.findOne({
    where: { id: resPub.aId },
  });

  const resProto = await ctx.seq.models.approveProto.findOne({
    where: { id: resIns.apId },
  });

  return { resIns, resProto };
}

// 创建/编辑原型
router.post('/saveProto', async (ctx) => {
  const { stage, id, businessId, type } = ctx.request.body;

  if (
    !(await hasAppAccess({
      ctx,
      id: businessId,
      user_id: ctx.gitUid,
    }))
  ) {
    ctx.status = 400;
    ctx.body = { message: '没有操作权限' };
    return;
  }

  if (!businessId || !type) {
    ctx.status = 400;
    ctx.body = { message: '业务参数必填' };
    return;
  }

  const businessMap = {
    app: {
      model: ctx.seq.models.app,
      filter: { gitId: businessId },
    },
  };

  if (!Array.isArray(stage)) {
    ctx.status = 400;
    ctx.body = { message: '格式不正确' };
    return;
  }
  if (stage.some((v) => !Array.isArray(v))) {
    ctx.status = 400;
    ctx.body = { message: '格式不正确' };
    return;
  }

  const stageArr = stage;
  if (stageArr.length < 2) {
    ctx.status = 400;
    ctx.body = { message: '审批环节最少2个' };
    return;
  } else if (stageArr.length > 10) {
    ctx.status = 400;
    ctx.body = { message: '审批环节最多10个' };
    return;
  }

  if (stageArr.some((v) => v.length < 1)) {
    ctx.status = 400;
    ctx.body = { message: '每个环节最少1个审批人' };
    return;
  } else if (stageArr.some((v) => v.length > 5)) {
    ctx.status = 400;
    ctx.body = { message: '每个环节最多5个审批人' };
    return;
  }

  // 编辑
  if (id) {
    await ctx.seq.models.approveProto.update(
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
    const res = await ctx.seq.models.approveProto.create({
      stage: JSON.stringify(stage),
    });

    const res2 = await businessMap[type].model.findOne({
      where: businessMap[type].filter,
    });

    if (res2.apId) {
      ctx.status = 400;
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
    ctx.status = 400;
    ctx.body = { message: '业务参数必填' };
    return;
  }

  const businessMap = {
    app: {
      model: ctx.seq.models.app,
      idKey: 'gitId',
    },
  };

  const res = await businessMap[type].model.findOne({
    where: {
      [businessMap[type].idKey]: businessId,
    },
  });

  if (!res.apId) {
    // 这里返回200，没找到也要正常展示
    // ctx.status = 400;
    ctx.body = { message: '未找到关联的业务对象' };
    return;
  }

  const res2 = await ctx.seq.models.approveProto.findOne({
    where: { id: res.apId },
  });

  ctx.body = res2;
});

// 审核实例
router.post('/saveIns', async (ctx) => {
  const { id, result } = ctx.request.body;

  const { resIns, resProto } = await getInsNProto({ ctx, id });

  const { stageId, status, approver } = resIns;
  const { stage } = resProto;

  const stageObj = JSON.parse(stage || '[]');

  if (status === approveStatusMap.pending) {
    if (stageObj[stageId].find((v) => v.i === ctx.uid)) {
      const approveRes = result === 'pass' ? 'pass' : 'fail';
      const approverArr = JSON.parse(approver || '[]');
      approverArr.push({ i: ctx.uid, n: ctx.username });

      if (approveRes === 'pass') {
        // 审核通过
        await ctx.seq.models.approveIns.update(
          {
            stageId: Math.min(+stageId + 1, stageObj.length - 1),
            status:
              +stageId + 1 >= stageObj.length
                ? approveStatusMap.done
                : approveStatusMap.pending,
            approver: JSON.stringify(approverArr),
          },
          {
            where: { id: resIns.id },
          }
        );
      } else {
        // 审核拒绝
        await ctx.seq.models.approveIns.update(
          {
            status: approveStatusMap.fail,
            approver: JSON.stringify(approverArr),
          },
          {
            where: { id: resIns.id },
          }
        );
      }

      ctx.body = { message: '操作成功' };
    } else {
      ctx.status = 400;
      ctx.body = { message: '无审核权限' };
    }
  } else {
    ctx.status = 400;
    ctx.body = { message: '审核流程已完结' };
  }
});

// 获取实例详情
router.get('/getIns', async (ctx) => {
  const { id } = ctx.request.query;

  const { resIns, resProto } = await getInsNProto({ ctx, id });

  ctx.body = { resIns, resProto };
});

module.exports = router.routes();
