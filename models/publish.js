const { DataTypes, Sequelize } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'publish',
    {
      branch: { type: DataTypes.STRING(200), allowNull: false },
      desc: DataTypes.STRING(100),
      commitId: { type: DataTypes.STRING(200), allowNull: false },
      // 发布Id，用时间戳表示
      id: {
        type: DataTypes.DATE,
        primaryKey: true,
        defaultValue: Sequelize.NOW,
      },
      // 创建人、编辑人 uid
      creator: { type: DataTypes.STRING(20), allowNull: false },
      updater: { type: DataTypes.STRING(20), allowNull: false },
    },
    {
      // createdAt: false,
      // updatedAt: false,
    }
  );
};
