module.exports = (router) => {
  router.use('/login', require('./login'));
  router.use('/app', require('./app'));
  router.use('/log', require('./log'));
  router.use('/user', require('./user'));
  router.use('/userApp', require('./userApp'));
};
