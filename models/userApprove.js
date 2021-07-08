const { DataTypes } = require('sequelize');

// 记录用户需要审批的实例
module.exports = (conn) => {
  return conn.define(
    'userApprove',
    {
      // 用户Id
      gitUid: { type: DataTypes.STRING(20), primaryKey: true },
      // 审批实例Id
      aId: { type: DataTypes.STRING(20), allowNull: false },
      // 审批类型
      type: { type: DataTypes.ENUM('publish'), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
