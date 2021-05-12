module.exports = (conn) => {
  return {
    users: require('./users')(conn),
    appList: require('./appList')(conn),
    publishList: require('./publishList')(conn),
  };
};
