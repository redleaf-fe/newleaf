const { DataTypes } = require('sequelize');

// 记录所有注册的用户
module.exports = (conn) => {
  return conn.define(
    'user',
    {
      userName: { type: DataTypes.STRING(20), allowNull: false },
      password: { type: DataTypes.STRING(80), allowNull: false },
      // 用户Id
      uid: { type: DataTypes.STRING(20), primaryKey: true },
      // 用户所属的应用Id列表
      appList: DataTypes.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
    }
  );
};
