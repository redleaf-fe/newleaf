const { DataTypes } = require('sequelize');

// 用户和app的关联关系
module.exports = (conn) => {
  return conn.define(
    'userApp',
    {
      // 用户Id
      uid: DataTypes.STRING(20),
      // 应用Id
      appId: DataTypes.STRING(20),
      // 用户权限：admin, develop, view
      auth: DataTypes.STRING(20),
    },
    {
      createdAt: false,
      updatedAt: false,
    }
  );
};
