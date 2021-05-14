module.exports = (router) => {
  router.use('/login', require('./login'));
  router.use('/app', require('./app'));
};
