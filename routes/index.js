module.exports = (router) => {
  router.use('/home', require('./home'));
  router.use('/config', require('./config'));
  router.use('/users', require('./users'));
};
