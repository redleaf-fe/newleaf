const { DataTypes, Sequelize } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'publishList',
    {
      branch: DataTypes.STRING(200),
      commitId: DataTypes.STRING(200),
      // 发布Id，用时间戳表示
      uid: {
        type: DataTypes.DATE,
        primaryKey: true,
        defaultValue: Sequelize.NOW
      }
    },
    {
      // createdAt: false,
      // updatedAt: false,
    }
  );
};
