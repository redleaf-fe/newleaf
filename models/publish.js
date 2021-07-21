const { DataTypes } = require('sequelize');

// app的发布数据
module.exports = (seq) => {
  return seq.define(
    'publish',
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      desc: DataTypes.STRING(100),
      appId: { type: DataTypes.STRING(20), allowNull: false },
      appName: { type: DataTypes.STRING(100), allowNull: false },
      branch: { type: DataTypes.STRING(100), allowNull: false },
      commit: { type: DataTypes.STRING(100), allowNull: false },
      // 状态，发布中、发布结束
      publishStatus: {
        type: DataTypes.ENUM('pending', 'doing', 'done', 'fail'),
        allowNull: false,
        defaultValue: 'pending',
      },
      // 状态，发布中、发布结束
      buildStatus: {
        type: DataTypes.ENUM('pending', 'doing', 'done', 'fail'),
        allowNull: false,
        defaultValue: 'pending',
      },
      // 发布环境
      env: {
        type: DataTypes.ENUM('daily', 'pre', 'perf', 'prod'),
        allowNull: false,
        defaultValue: 'pre',
      },
      // 审批实例Id，生产才需要审批
      aId: DataTypes.STRING(20),
      // 创建人
      creator: { type: DataTypes.STRING(20), allowNull: false },
      creatorId: { type: DataTypes.STRING(20), allowNull: false },
      // 未发布及发布失败的机器
      failedServer: DataTypes.TEXT,
    },
    {
      charset: 'utf8',
    }
  );
};
