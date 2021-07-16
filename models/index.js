module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    login: require('./login')(conn),
    app: require('./app')(conn),
    publishServer: require('./publishServer')(conn),
    buildServer: require('./buildServer')(conn),
    publish: require('./publish')(conn),
    approveProto: require('./approveProto')(conn),
    approveIns: require('./approveIns')(conn),
    userApp: require('./userApp')(conn),
    userApprove: require('./userApprove')(conn),
  };
};
