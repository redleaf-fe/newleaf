const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'user',
    {
      name: DataTypes.STRING(20),
      // 用户Id
      uid: { type: DataTypes.STRING(20), primaryKey: true },
      // 用户所属的应用Id列表
      appList: DataTypes.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
    },
  );
};
