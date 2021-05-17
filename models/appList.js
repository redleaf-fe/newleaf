const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'appList',
    {
      // 只支持英文、数字和-
      appName: { type: DataTypes.STRING(20), allowNull: false },
      // 应用描述
      desc: DataTypes.STRING(100),
      // 应用唯一Id
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      // 创建人、编辑人 uid
      creator: { type: DataTypes.STRING(20), allowNull: false },
      updater: { type: DataTypes.STRING(20), allowNull: false },
      // git地址，允许为空，部分应用不需要使用发布相关功能
      git: DataTypes.STRING(200),
    },
    {
      // createdAt: false,
      // updatedAt: false,
    }
  );
};
