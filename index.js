const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const BodyParser = require('koa-body');
const Send = require('koa-send');
// const Helmet = require('koa-helmet');
const nunjucks = require('nunjucks');
const { Sequelize } = require('sequelize');
const KeyGrip = require('keygrip');

const config = require('./env.json');
const { Database, CodeRepo } = require('./services');
const { LoginMiddleware } = require('./middlewares');

async function main() {
  const conn = new Sequelize({
    host: config.databaseHost,
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
    await Database.initDatabase(conn);
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败：', error);
  }

  const app = new Koa();
  const router = new Router();

  app.context.codeRepo = new CodeRepo(config.gitType);
  app.context.conn = conn;

  app.keys = new KeyGrip(config.keys.split(','), 'sha256');

  // app.use(Helmet());
  // 跨域配置
  app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', 'http://localhost:3020');
    ctx.set('Access-Control-Allow-Headers', 'content-type');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    await next();
  });

  if (config.dev) {
    app.use(Logger());
  }

  app.use(BodyParser());

  app.use(async (ctx, next) => {
    if (ctx.path.startsWith('/static/')) {
      await Send(ctx, ctx.path.slice(8), { root: __dirname + '/views' });
    } else {
      await next();
    }
  });

  nunjucks.configure('views');
  app.use(async (ctx, next) => {
    if (ctx.path.startsWith('/page/')) {
      ctx.body = nunjucks.render('index.html');
    } else {
      await next();
    }
  });

  // 登录和权限
  app.use(LoginMiddleware);

  require('./routes')(router);

  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = config.serverPort || 3000;
  app.listen(port);
}

main();
