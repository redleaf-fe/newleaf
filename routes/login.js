const Router = require('koa-router');
const crypto = require('crypto');
const Schema = require('validate');
const { salt } = require('../env.json');
const { IdGenerate } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const schema = new Schema({
  userName: {
    type: String,
    required: true,
    length: { min: 4, max: 32 },
    message: {
      required: '用户名必填',
      length: '用户名需要4到32字符之间',
    },
  },
  password: {
    type: String,
    required: true,
    length: { min: 8, max: 32 },
    message: {
      required: '密码必填',
      length: '密码需要8到32字符之间',
    },
  },
});

router.post('/login', async (ctx) => {
  const { userName, password } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { userName, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');
  const res = await ctx.conn.models.user.findAll({
    where: { name: userName },
  });

  console.log(res);

  ctx.body = JSON.stringify({ redirectUrl: '/dashboard' });
});

router.post('/register', async (ctx) => {
  const { userName, password } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { userName, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');

  const uid = await IdGenerate.idGenerate({
    conn: ctx.conn,
    modelName: 'user',
  });

  // 查询重复的用户名
  const findRepeat = await ctx.conn.models.user.findAll({
    where: { name: userName },
  });

  if (findRepeat.length > 0) {
    ctx.status = 400;
    // todo: 实时查询用户名使用情况？
    ctx.body = JSON.stringify({ message: '用户名已被使用' });
    return;
  }

  await ctx.conn.models.user.create({
    name: userName,
    password: encrypt,
    appList: '',
    uid,
  });

  ctx.body = JSON.stringify({ redirectUrl: '/dashboard' });
});

module.exports = router.routes();
