module.exports = (ctx) => {
  return {
    users: require('./users')(ctx),
    appList: require('./appList')(ctx),
    publishList: require('./publishList')(ctx),
  };
};
