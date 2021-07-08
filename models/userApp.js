const { DataTypes } = require('sequelize');

// 记录用户和应用的关联关系，gitlab的api只能获取到用户创建的应用，不能获取到用户参与的应用
module.exports = (conn) => {
  return conn.define(
    'userApp',
    {
      // 用户Id
      gitUid: { type: DataTypes.STRING(20), allowNull: false },
      // 用户名
      username: { type: DataTypes.STRING(20), allowNull: false },
      // 应用名称
      appName: { type: DataTypes.STRING(20), allowNull: false },
      // 应用Id
      appId: { type: DataTypes.STRING(20), allowNull: false },
      // 用户权限
      auth: { type: DataTypes.STRING(3), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
