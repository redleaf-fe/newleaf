module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    login: require('./login')(conn),
    appList: require('./appList')(conn),
    publishList: require('./publishList')(conn)
  };
};
