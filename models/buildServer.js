const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'buildServer',
    {
      // id默认生成
      server: { type: DataTypes.STRING(2048), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
