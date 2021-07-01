const { DataTypes } = require('sequelize');

// 存储审批实例，因为一个操作可能有多个审批实例，比如一个应用可能有多个发布，需要创建不同的审批实例
// 也不能直接挂在发布的表上，因为如果有其他类型的审批，各自使用的ID可能会重复
module.exports = (conn) => {
  return conn.define(
    'approveIns',
    {
      // 审批阶段Id，最多10个阶段
      stageId: { type: DataTypes.STRING(3), allowNull: false },
      // 审批状态
      status: {
        type: DataTypes.ENUM('pending', 'doing', 'done', 'fail'),
        allowNull: false,
      },
      // 审批原型Id
      apId: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
