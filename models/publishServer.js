const { DataTypes } = require('sequelize');

module.exports = (seq) => {
  return seq.define(
    'publishServer',
    {
      // git内Id
      gitId: { type: DataTypes.STRING(20), allowNull: false },
      env: {
        type: DataTypes.ENUM('daily', 'pre', 'perf', 'prod'),
        allowNull: false,
      },
      server: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      charset: 'utf8',
    }
  );
};
