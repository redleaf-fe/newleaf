const { DataTypes } = require('sequelize');

// 审批原型，用于创建审批实例
module.exports = (seq) => {
  return seq.define(
    'approveProto',
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
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
