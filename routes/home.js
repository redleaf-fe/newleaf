const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const router = new Router();

router.get('/', (ctx) => {
  const configPath = path.resolve('./monitor.json');
  if (fs.existsSync(configPath)) {
    ctx.redirect('/#/dashboard');
  } else {
    ctx.redirect('/#/firstIn');
  }
});

module.exports = router.routes();
