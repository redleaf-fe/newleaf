module.exports = (router) => {
  router.use('/config', require('./config'));
  router.use('/login', require('./login'));
  router.use('/app', require('./app'));
};
