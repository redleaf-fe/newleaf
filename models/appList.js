const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'appList',
    {
      // 只支持英文、数字和-
      appName: DataTypes.STRING(20),
      // 应用唯一Id
      uid: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      // 创建人、编辑人
      creator: DataTypes.STRING(20),
      updater: DataTypes.STRING(20),
      // git地址
      git: DataTypes.STRING(200)
    },
    {
      // createdAt: false,
      // updatedAt: false,
    }
  );
};
