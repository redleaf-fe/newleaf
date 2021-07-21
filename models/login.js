const { DataTypes } = require('sequelize');

// 记录当前已登录的用户
module.exports = (seq) => {
  return seq.define(
    'login',
    {
      // 用户Id
      uid: { type: DataTypes.STRING(20), primaryKey: true },
      // 用户名
      username: { type: DataTypes.STRING(20), allowNull: false },
      // git生成的用户Id
      gitUid: { type: DataTypes.STRING(20), allowNull: false },
      // session
      loginToken: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
