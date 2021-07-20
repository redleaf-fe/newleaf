const { DataTypes } = require('sequelize');

// 存储审批实例，因为一个操作可能有多个审批实例，比如一个应用可能有多个发布，需要创建不同的审批实例
// 也不能直接挂在发布的表上，因为如果有其他类型的审批，各自使用的ID可能会重复
module.exports = (conn) => {
  return conn.define(
    'approveIns',
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      // 已审核的人，结构同approveProto的stage
      approver: DataTypes.TEXT,
      // 审批阶段Id，最多10个阶段，从0开始
      stageId: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 0 },
      // 审批状态
      status: {
        type: DataTypes.ENUM('pending', 'doing', 'done', 'fail'),
        allowNull: false,
        defaultValue: 'pending',
      },
      // 审批原型Id
      apId: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
