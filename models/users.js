const { DataTypes } = require('sequelize');

module.exports = (ctx) => {
  return ctx.conn.define(
    'user',
    {
      name: DataTypes.STRING(20),
      // 外部导入ID
      uid: DataTypes.STRING(20),
      // 内部用ID
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      createdAt: false,
      updatedAt: false,
    },
  );
};
