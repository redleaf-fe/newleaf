const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const BodyParser = require('koa-body');
const Helmet = require('koa-helmet');
const nunjucks = require('nunjucks');
const mysql = require('mysql2/promise');

const config = require('./env.json');
const pkg = require('./package.json');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: config.user,
    password: config.password
  });

  const app = new Koa();
  const router = new Router();

  nunjucks.configure('views');

  // app.use(Helmet());
  app.use(Logger());
  app.use(BodyParser());

  app.use((ctx, next) => {
    ctx.conn = conn;
    next();
  });

  require('./routes')(router);
  router.register(['/'], ['GET', 'POST'], (ctx, next) => {
    ctx.body = nunjucks.render('index.html');
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = pkg.port || 3000;
  app.listen(port);
}

main();


