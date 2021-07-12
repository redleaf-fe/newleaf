const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'app',
    {
      name: { type: DataTypes.STRING(100), primaryKey: true },
      // git内Id
      gitId: { type: DataTypes.STRING(20), allowNull: false },
      // 创建人、编辑人
      creator: { type: DataTypes.STRING(20), allowNull: false },
      updater: { type: DataTypes.STRING(20), allowNull: false },
      // 哪些环境正在发布
      /*
        ['pre', 'prod']
       */
      isPublishing: {
        type: DataTypes.STRING(30),
        defaultValue: '[]',
        allowNull: false,
      },
      // 审批原型Id
      apId: { type: DataTypes.STRING(20) },
    },
    {
      charset: 'utf8',
    }
  );
};
