module.exports = (router) => {
  router.use('/config', require('./config'));
  router.use('/login', require('./login'));
  router.use('/user', require('./user'));
};
