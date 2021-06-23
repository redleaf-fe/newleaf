module.exports = (router) => {
  router.use('/login', require('./login'));
  router.use('/group', require('./group'));
  router.use('/app', require('./app'));
  router.use('/appPublish', require('./appPublish'));
  router.use('/log', require('./log'));
  router.use('/user', require('./user'));
  router.use('/userApp', require('./userApp'));
  router.use('/userGroup', require('./userGroup'));
};
