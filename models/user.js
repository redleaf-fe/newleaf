const { DataTypes } = require('sequelize');

// 记录所有注册的用户
module.exports = (conn) => {
  return conn.define(
    'user',
    {
      userName: DataTypes.STRING(20),
      password: DataTypes.STRING(80),
      // 用户Id
      uid: { type: DataTypes.STRING(20), primaryKey: true },
      // 用户所属的应用Id列表
      appList: DataTypes.STRING
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
};
