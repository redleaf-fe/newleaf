module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    login: require('./login')(conn),
    appPublish: require('./appPublish')(conn),
  };
};
