const { DataTypes } = require('sequelize');

// app的发布数据
module.exports = (conn) => {
  return conn.define(
    'publish',
    {
      branch: { type: DataTypes.STRING(200), allowNull: false },
      commitId: { type: DataTypes.STRING(200), allowNull: false },
      desc: DataTypes.STRING(100),
      name: { type: DataTypes.STRING(20), allowNull: false },
      appId: { type: DataTypes.STRING(20), allowNull: false },
      appName: { type: DataTypes.STRING(20), allowNull: false },
      // 创建人
      creator: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      // createdAt: false,
      // updatedAt: false,
      charset: 'utf8',
    }
  );
};
