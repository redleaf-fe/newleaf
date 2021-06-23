module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    login: require('./login')(conn),
    group: require('./group')(conn),
    app: require('./app')(conn),
    appPublish: require('./appPublish')(conn),
  };
};
