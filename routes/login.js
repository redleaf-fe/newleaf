const Router = require('koa-router');
const crypto = require('crypto');
const Schema = require('validate');

const { salt } = require('../env.json');
const { IdGenerate } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const cookieConfig = {
  signed: true,
  maxAge: 24 * 3600 * 1000,
  httpOnly: true,
};

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

async function setCookie({ ctx, uid, userName }) {
  // 判断是否已经登录过
  const res = await ctx.conn.models.login.findAll({
    attributes: ['uid'],
    where: { uid },
  });

  // 生成登录token
  const token = await IdGenerate.idGenerate({
    conn: ctx.conn,
    modelName: 'login',
  });

  if (res.length > 0) {
    await ctx.conn.models.login.update({
      uid,
      loginToken: token,
    });
  } else {
    await ctx.conn.models.login.create({
      uid,
      loginToken: token,
    });
  }

  ctx.cookies.set('token', token, cookieConfig);
  ctx.cookies.set('userName', userName, cookieConfig);
}

router.post('/login', async (ctx) => {
  const { userName, password } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { userName, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');
  const res = await ctx.conn.models.user.findAll({
    attributes: ['password', 'uid', 'name'],
    where: { name: userName },
  });

  if (res.length > 0) {
    // 校验密码
    if (res[0].password === encrypt) {
      setCookie({ ctx, uid: res[0].uid, userName: res[0].name });

      ctx.status = 302;
      ctx.body = JSON.stringify({ redirectUrl: '/dashboard' });
    } else {
      ctx.status = 400;
      ctx.body = JSON.stringify({ message: '用户名或密码错误' });
    }
  } else {
    ctx.status = 400;
    ctx.body = JSON.stringify({ message: '用户未注册' });
  }
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
    attributes: ['name'],
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

  setCookie({ ctx, uid, userName });

  ctx.status = 302;
  ctx.body = JSON.stringify({ redirectUrl: '/dashboard' });
});

module.exports = router.routes();
