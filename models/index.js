module.exports = (ctx) => {
  return {
    users: require('./users')(ctx),
  };
};
