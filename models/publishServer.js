const { DataTypes } = require('sequelize');

module.exports = (conn) => {
  return conn.define(
    'publishServer',
    {
      // git内Id
      gitId: { type: DataTypes.STRING(20), allowNull: false },
      env: {
        type: DataTypes.ENUM('daily', 'pre', 'perf', 'prod'),
        allowNull: false,
      },
      server: { type: DataTypes.STRING(2048), allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
