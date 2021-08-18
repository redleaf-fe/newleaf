module.exports = (router) => {
  router.use('/login', require('./login'));
  router.use('/app', require('./app'));
  router.use('/publish', require('./publish'));
  router.use('/log', require('./log'));
  router.use('/user', require('./user'));
  router.use('/approve', require('./approve'));
  router.use('/sourceMap', require('./sourceMap'));
  router.use('/dashboard', require('./dashboard'));
};
