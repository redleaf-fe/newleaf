const { DataTypes } = require('sequelize');

// app的发布数据
module.exports = (conn) => {
  return conn.define(
    'publish',
    {
      branch: { type: DataTypes.STRING(100), allowNull: false },
      commitId: { type: DataTypes.STRING(100), allowNull: false },
      desc: DataTypes.STRING(100),
      name: { type: DataTypes.STRING(100), allowNull: false },
      appId: { type: DataTypes.STRING(20), allowNull: false },
      appName: { type: DataTypes.STRING(100), allowNull: false },
      // 发布阶段
      stage: { type: DataTypes.ENUM('null', 'daily', 'pre', 'prod'), allowNull: false },
      // 审批实例Id
      aId: { type: DataTypes.STRING(20), allowNull: false },
      // 创建人
      creator: { type: DataTypes.STRING(20), allowNull: false },
      creatorId: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
