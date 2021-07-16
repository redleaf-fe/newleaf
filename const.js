const flowMap = {
  pending: 'pending',
  doing: 'doing',
  done: 'done',
  fail: 'fail',
};

module.exports = {
  // 环境
  envMap: {
    daily: 'daily',
    pre: 'pre',
    perf: 'perf',
    prod: 'prod',
  },
  // 打包状态
  buildStatusMap: flowMap,
  // 发布状态
  publishStatusMap: flowMap,
  // 审批状态
  approveStatusMap: flowMap,
  // 审批类型
  approveTypeMap: {
    publish: 'publish',
  },
  // 错误码
  errCode: {
    distNotExist: 1001,
  },
};
