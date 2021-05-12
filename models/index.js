module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    appList: require('./appList')(conn),
    publishList: require('./publishList')(conn),
  };
};
