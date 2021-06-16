const Router = require('koa-router');
const crypto = require('crypto');
const Schema = require('validate');

const { salt, sessionValidTime } = require('../env.json');
const { idGenerate, findRepeat } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const cookieConfig = {
  signed: true,
  maxAge: sessionValidTime,
  httpOnly: true,
};

const baseSchema = {
  username: {
    type: String,
    required: true,
    length: { min: 4, max: 20 },
    message: {
      required: '用户名必填',
      length: '用户名需要4到20字符之间',
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
};

const loginSchema = new Schema(baseSchema);

const registerSchema = new Schema({
  ...baseSchema,
  email: {
    type: String,
    required: true,
    length: { max: 100 },
    match:
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    message: {
      required: '邮箱必填',
      match: '邮箱格式不正确',
      length: '邮箱长度小于100',
    },
  },
});

async function setCookie({ ctx, uid, username }) {
  // 判断是否已经登录过
  const res = await ctx.conn.models.login.findOne({
    attributes: ['uid'],
    where: { uid },
  });

  // 生成登录token
  const token = await idGenerate({
    ctx,
    modelName: 'login',
    idName: 'uid',
  });

  if (res) {
    // 更新token
    await ctx.conn.models.login.update(
      {
        loginToken: token,
      },
      {
        where: {
          uid,
        },
      }
    );
  } else {
    await ctx.conn.models.login.create({
      uid,
      loginToken: token,
    });
  }

  ctx.cookies.set('token', token, cookieConfig);
  ctx.cookies.set('username', username, { httpOnly: false });
}

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  if (!validate({ ctx, schema: loginSchema, obj: { username, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');
  const res = await ctx.conn.models.user.findOne({
    attributes: ['password', 'uid', 'username'],
    where: { username },
  });

  if (res) {
    // 校验密码
    if (res.password === encrypt) {
      await setCookie({ ctx, uid: res.uid, username: res.username });

      ctx.status = 302;
      ctx.body = { redirectUrl: '/dashboard' };
    } else {
      ctx.status = 400;
      ctx.body = { message: '用户名或密码错误' };
    }
  } else {
    ctx.status = 400;
    ctx.body = { message: '用户未注册' };
  }
});

router.post('/register', async (ctx) => {
  const { username, password, email } = ctx.request.body;
  if (
    !validate({
      ctx,
      schema: registerSchema,
      obj: { username, password, email },
    })
  ) {
    return;
  }

  if (
    (await findRepeat({
      ctx,
      modelName: 'user',
      queryKey: ['username'],
      queryObj: { username },
      repeatMsg: '用户名已被使用',
    })) ||
    (await findRepeat({
      ctx,
      modelName: 'user',
      queryKey: ['email'],
      queryObj: { email },
      repeatMsg: '邮箱已被使用',
    }))
  ) {
    return;
  }

  const res = await ctx.codeRepo.createUser({
    username,
    password,
    email,
  });

  if (res.data) {
    const uid = res.data.id;
    const sha256 = crypto.createHash('sha256');
    const encrypt = sha256.update(password + salt).digest('base64');

    await ctx.conn.models.user.create({
      username,
      password: encrypt,
      uid,
      email,
    });

    await setCookie({ ctx, uid, username });

    ctx.status = 302;
    ctx.body = { redirectUrl: '/dashboard' };
  } else {
    ctx.body = { message: res.response.data.message };
  }
});

module.exports = router.routes();
