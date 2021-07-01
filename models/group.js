const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'group',
    {
      // 只支持英文、数字和-
      name: { type: DataTypes.STRING(20), primaryKey: true },
      // git内Id
      gitId: { type: DataTypes.STRING(20), allowNull: false },
      // 创建人、编辑人
      creator: { type: DataTypes.STRING(20), allowNull: false },
      updater: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
