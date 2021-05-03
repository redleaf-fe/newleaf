const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const BodyParser = require('koa-body');
const Helmet = require('koa-helmet');
const Respond = require('koa-respond');

const pkg = require('./package.json');

const app = new Koa();
const router = new Router();

app.use(Helmet());
app.use(Logger());
app.use(BodyParser());
app.use(Respond());

// API routes
require('./routes')(router);
app.use(router.routes());
app.use(router.allowedMethods());

const port = pkg.port || 3000;
app.listen(port);
