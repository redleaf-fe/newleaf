const { DataTypes } = require('sequelize');

// 审批原型，用于创建审批实例
module.exports = (conn) => {
  return conn.define(
    'approveProto',
    {
      // id会默认生成
      
      // 环节详情，上限10个环节，每个环节最多5个人
      /*
        n: xxx 审批人姓名
        i: yyy 审批人uid
        [[{ n:xxx, i:yyy }, ...], [...]]
       */
      stage: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
    }
  );
};
