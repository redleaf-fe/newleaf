const { DataTypes } = require('sequelize');

// 记录当前已登录的用户
module.exports = (conn) => {
  return conn.define(
    'login',
    {
      // 用户Id
      uid: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      // session
      loginToken: DataTypes.STRING(20),
    },
    {
      createdAt: false,
      // updatedAt: false,
    },
  );
};
