const Router = require('koa-router');
const router = new Router();
const { hello } = require('../controllers/users');

router.get('/', hello);

module.exports = router.routes();
