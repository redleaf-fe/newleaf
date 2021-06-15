const { DataTypes } = require('sequelize');

// app的发布数据
module.exports = (conn) => {
  return conn.define(
    'appPublish',
    {
      branch: { type: DataTypes.STRING(200), allowNull: false },
      commitId: { type: DataTypes.STRING(200), allowNull: false },
      desc: DataTypes.STRING(100),
      name: { type: DataTypes.STRING(20), allowNull: false },
      appId: DataTypes.STRING(20),
      appName: DataTypes.STRING(20),
      // 发布Id
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
      },
      // 创建人、编辑人 uid
      creator: { type: DataTypes.STRING(20), allowNull: false },
      updater: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      // createdAt: false,
      // updatedAt: false,
    }
  );
};
