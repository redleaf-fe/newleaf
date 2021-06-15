module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    login: require('./login')(conn),
    app: require('./app')(conn),
    appPublish: require('./appPublish')(conn),
    userApp: require('./userApp')(conn),
  };
};
