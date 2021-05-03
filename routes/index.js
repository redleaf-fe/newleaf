module.exports = (router) => {
  router.use('/home', require('./home'));
  router.use('/users', require('./users'));
};
