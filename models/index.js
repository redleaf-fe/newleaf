module.exports = (conn) => {
  return {
    user: require('./user')(conn),
    login: require('./login')(conn),
    app: require('./app')(conn),
    publish: require('./publish')(conn),
    approveProto: require('./approveProto')(conn),
    approveIns: require('./approveIns')(conn),
    userApprove: require('./userApprove')(conn),
  };
};
