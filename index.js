const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const BodyParser = require('koa-body');
// const Helmet = require('koa-helmet');
const nunjucks = require('nunjucks');
const { Sequelize } = require('sequelize');

const config = require('./env.json');
const pkg = require('./package.json');
const { Database } = require('./services');
const { Login } = require('./middlewares');

async function main() {
  const conn = new Sequelize({
    host: 'localhost',
    dialect: 'mysql',
    username: config.username,
    password: config.password,
    port: config.port,
    database: config.database,
    define: {
      freezeTableName: true,
    },
  });

  try {
    await conn.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败：', error);
  }

  try {
    await Database.initDatabase(conn);
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败：', error);
  }

  const app = new Koa();
  const router = new Router();

  nunjucks.configure('views');

  // app.use(Helmet());
  app.use(Logger());
  app.use(BodyParser());

  // 数据库
  app.use(async (ctx, next) => {
    ctx.conn = conn;
    await next();
  });

  // 登录和权限
  app.use(Login);

  require('./routes')(router);
  router.register(['/'], ['GET', 'POST'], (ctx) => {
    ctx.body = nunjucks.render('index.html');
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = pkg.port || 3000;
  app.listen(port);
}

main();
