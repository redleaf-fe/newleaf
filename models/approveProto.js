const { DataTypes } = require('sequelize');

// 审批原型，用于创建审批实例
module.exports = (conn) => {
  return conn.define(
    'approveProto',
    {
      // 环节详情，上限10个环节，每个环节最多5个人
      /*
        n: xxx 审批人姓名
        i: yyy 审批人uid
       */
      stage: {
        type: DataTypes.STRING(10000),
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
    }
  );
};
