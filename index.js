const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const BodyParser = require('koa-body');
// const Helmet = require('koa-helmet');
const nunjucks = require('nunjucks');
const { Sequelize } = require('sequelize');
const KeyGrip = require('keygrip');

const config = require('./env.json');
const pkg = require('./package.json');
const { Database } = require('./services');
const { LoginMiddleware } = require('./middlewares');

async function main() {
  const conn = new Sequelize({
    host: 'localhost',
    dialect: 'mysql',
    username: config.databaseUserName,
    password: config.databasePassword,
    port: config.databasePort,
    database: config.databaseName,
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
    await Database.initDatabase(ctx);
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败：', error);
  }

  const app = new Koa();
  const router = new Router();

  app.context.conn = conn;

  app.keys = new KeyGrip(config.keys.split(','), 'sha256');

  nunjucks.configure('views');

  // app.use(Helmet());
  // 跨域配置
  app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', 'http://localhost:3020');
    ctx.set('Access-Control-Allow-Headers', 'content-type');
    await next();
  });
  app.use(Logger());
  app.use(BodyParser());

  // 登录和权限
  app.use(LoginMiddleware);

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
