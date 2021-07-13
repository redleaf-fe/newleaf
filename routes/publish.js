const Router = require('koa-router');
const Schema = require('validate');
const { Op } = require('sequelize');
const axios = require('axios');
const config = require('../env.json');

const { validate } = require('../utils');
const {
  envMap,
  publishStatusMap,
  approveStatusMap,
  buildStatusMap,
} = require('../const');

const router = new Router();

const schema = new Schema({
  appId: {
    required: true,
    length: { max: 20 },
    message: {
      required: '应用Id必填',
      length: '应用Id不大于20字符',
    },
  },
  appName: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '应用名称必填',
      length: '应用名称不大于100字符',
    },
  },
  branch: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '分支名必填',
      length: '分支名不大于100字符',
    },
  },
  commit: {
    type: String,
    required: true,
    length: { max: 100 },
    message: {
      required: '提交Id必填',
      length: '提交Id不大于100字符',
    },
  },
});

router.get('/list', async (ctx) => {
  const { appId, env, currentPage = 1, pageSize = 10 } = ctx.request.query;

  if (!appId) {
    ctx.status = 400;
    ctx.body = { message: '应用id必填' };
    return;
  }

  const filter = {
    [Op.and]: [
      {
        appId,
        env,
      },
    ],
  };

  const publish = await ctx.conn.models.publish.findAndCountAll({
    offset: pageSize * (currentPage - 1),
    limit: Number(pageSize),
    where: filter,
    order: [['updatedAt', 'DESC']],
  });

  ctx.body = publish;
});

router.post('/save', async (ctx) => {
  const { appId, appName, desc = '', branch, commit, env } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { appId, appName, branch, commit } })) {
    return;
  }

  let approveInsId;

  if (env === envMap.prod) {
    const res = await ctx.conn.models.app.findOne({
      where: { gitId: appId },
    });

    if (!res.apId) {
      ctx.status = 400;
      ctx.body = { message: '获取应用审核环节失败' };
      return;
    }

    // 创建审批实例
    const res2 = await ctx.conn.models.approveIns.create({
      stageId: 0,
      status: approveStatusMap.pending,
      apId: res.apId,
    });

    if (!res2.id) {
      ctx.status = 400;
      ctx.body = { message: '创建审核实例失败' };
      return;
    }

    approveInsId = res2.id;
  }

  const param = {
    appId,
    appName,
    desc,
    branch,
    commit,
    creatorId: ctx.uid,
    creator: ctx.username,
    env,
    status: publishStatusMap.pending,
  };

  if (approveInsId) {
    param.aId = approveInsId;
  }

  await ctx.conn.models.publish.create(param);
  ctx.body = { message: '创建成功' };
});

router.post('/publishResult', async (ctx) => {
  const { id = '', result } = ctx.request.body;

  if (!id) {
    ctx.status = 400;
    ctx.body = { message: 'id必填' };
    return;
  }

  const status = result === 'success' ? 'done' : 'fail';

  await ctx.conn.models.publish.update(
    {
      status,
    },
    {
      where: { id },
    }
  );

  const res = await ctx.conn.models.publish.findOne({ where: { id } });
  const appInfo = await ctx.conn.models.app.findOne({ gitId: res.appId });
  let isPublishing = JSON.parse(appInfo.isPublishing);
  isPublishing = isPublishing.filter((v) => v !== res.env);

  await ctx.conn.models.app.update(
    {
      isPublishing: JSON.stringify(isPublishing),
    },
    {
      where: { gitId: res.appId },
    }
  );

  ctx.body = { id };
});

router.post('/buildResult', async (ctx) => {
  const { id = '', result } = ctx.request.body;

  if (!id) {
    ctx.status = 400;
    ctx.body = { message: 'id必填' };
    return;
  }

  const buildStatus = result === 'success' ? 'done' : 'fail';

  await ctx.conn.models.publish.update(
    {
      buildStatus,
    },
    {
      where: { id },
    }
  );

  const res = await ctx.conn.models.publish.findOne({ where: { id } });
  await ctx.conn.models.app.update(
    {
      isBuilding: false,
    },
    {
      where: { gitId: res.appId },
    }
  );

  ctx.body = { id };
});

// 发布
router.post('/publish', async (ctx) => {
  const { id = '', env } = ctx.request.body;

  const res = await ctx.conn.models.publish.findOne({
    where: {
      id,
    },
  });

  // 生产环境发布需要审核通过
  if (env === envMap.prod) {
    if (res.aId) {
      const res2 = await ctx.conn.models.approveIns.findOne({
        where: {
          id: res.aId,
        },
      });
      if (res2.status !== approveStatusMap.done) {
        ctx.status = 400;
        ctx.body = { message: '审核流程未完成' };
        return;
      }
    } else {
      ctx.status = 400;
      ctx.body = { message: '生产环境发布必须有审核流程' };
      return;
    }
  }

  // 判断是否有别人在发布
  const appInfo = await ctx.conn.models.app.findOne({ gitId: res.appId });
  const isPublishing = JSON.parse(appInfo.isPublishing);
  if (isPublishing.includes(env)) {
    ctx.status = 400;
    ctx.body = { message: '项目发布中' };
    return;
  }

  const { branch, commit, appName } = res;
  const res2 = await axios({
    url: `${config.publishSever}/publish`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: {
      appName,
      branch,
      commit,
      id,
    },
  });

  if (res2.data.id === id) {
    isPublishing.push(env);
    await ctx.conn.models.app.update(
      {
        isPublishing: JSON.stringify(isPublishing),
      },
      {
        where: { gitId: res.appId },
      }
    );

    await ctx.conn.models.publish.update(
      {
        status: publishStatusMap.doing,
      },
      {
        where: { id },
      }
    );

    ctx.body = { id };
    return;
  }

  ctx.status = 400;
  ctx.body = { message: res2.data.message };
});

// 打包
router.post('/build', async (ctx) => {
  const { id = '' } = ctx.request.body;

  const res = await ctx.conn.models.publish.findOne({
    where: {
      id,
    },
  });

  // 判断是否有别人在打包
  const appInfo = await ctx.conn.models.app.findOne({ gitId: res.appId });
  const isBuilding = JSON.parse(appInfo.isBuilding);
  if (isBuilding) {
    ctx.status = 400;
    ctx.body = { message: '项目打包中' };
    return;
  }

  const appDetail = await ctx.codeRepo.getProjectDetail({ id: res.appId });
  if (!appDetail.data) {
    ctx.status = 400;
    ctx.body = { message: '获取项目详情失败' };
    return;
  }

  const { branch, commit, appName } = res;
  const res2 = await axios({
    url: `${config.publishSever}/build/build`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: {
      appName,
      gitPath: `http://user1:11111111@${config.gitSever}/${appDetail.data.path_with_namespace}`,
      branch,
      commit,
      id,
    },
  });

  if (res2.data.id === id) {
    await ctx.conn.models.app.update(
      {
        isBuilding: true,
      },
      {
        where: { gitId: res.appId },
      }
    );

    await ctx.conn.models.publish.update(
      {
        buildStatus: buildStatusMap.doing,
      },
      {
        where: { id },
      }
    );

    ctx.body = { id };
    return;
  }

  ctx.status = 400;
  ctx.body = { message: res2.data.message };
});

module.exports = router.routes();
