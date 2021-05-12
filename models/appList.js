const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define('appList', {
    name: DataTypes.STRING(20),
    // 应用唯一Id
    uid: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
    // 创建人、编辑人
    createId: DataTypes.STRING(20),
    updateId: DataTypes.STRING(20),
    // createdAt
    // updatedAt
  });
};
