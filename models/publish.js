const { DataTypes } = require('sequelize');

// app的发布数据
module.exports = (conn) => {
  return conn.define(
    'publish',
    {
      desc: DataTypes.STRING(100),
      appId: { type: DataTypes.STRING(20), allowNull: false },
      appName: { type: DataTypes.STRING(100), allowNull: false },
      commit: { type: DataTypes.STRING(100), allowNull: false },
      // 发布环境
      env: {
        type: DataTypes.ENUM('daily', 'pre', 'perf', 'prod'),
        allowNull: false,
      },
      // 审批实例Id，生产才需要审批
      aId: DataTypes.STRING(20),
      // 创建人
      creator: { type: DataTypes.STRING(20), allowNull: false },
      creatorId: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
