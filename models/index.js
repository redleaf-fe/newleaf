module.exports = (seq) => {
  return {
    user: require('./user')(seq),
    login: require('./login')(seq),
    app: require('./app')(seq),
    publishServer: require('./publishServer')(seq),
    publish: require('./publish')(seq),
    approveProto: require('./approveProto')(seq),
    approveIns: require('./approveIns')(seq),
    userApp: require('./userApp')(seq),
    userApprove: require('./userApprove')(seq),
  };
};
