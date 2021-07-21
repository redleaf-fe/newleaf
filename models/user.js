const { DataTypes } = require('sequelize');

// 记录所有注册的用户
module.exports = (seq) => {
  return seq.define(
    'user',
    {
      username: { type: DataTypes.STRING(20), allowNull: false },
      // 这里存的是转码过的字符，所以比输入的密码要长
      password: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false },
      // 用户Id
      uid: { type: DataTypes.STRING(20), primaryKey: true },
      // git生成的用户Id
      gitUid: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
