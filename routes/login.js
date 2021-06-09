const Router = require('koa-router');
const crypto = require('crypto');
const Schema = require('validate');

const { salt, sessionValidTime } = require('../env.json');
const { idGenerate, createUniq } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const cookieConfig = {
  signed: true,
  maxAge: sessionValidTime,
  httpOnly: true,
};

const schema = new Schema({
  userName: {
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
});

async function setCookie({ ctx, uid, userName }) {
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
  ctx.cookies.set('userName', userName);
}

router.post('/login', async (ctx) => {
  const { userName, password } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { userName, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');
  const res = await ctx.conn.models.user.findOne({
    attributes: ['password', 'uid', 'userName'],
    where: { userName },
  });

  if (res) {
    // 校验密码
    if (res.password === encrypt) {
      await setCookie({ ctx, uid: res.uid, userName: res.userName });

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
  const { userName, password } = ctx.request.body;
  if (!validate({ ctx, schema, obj: { userName, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');

  const uid = await idGenerate({
    ctx,
    modelName: 'user',
    idName: 'uid',
  });

  if (
    await createUniq({
      ctx,
      modelName: 'user',
      queryKey: ['userName'],
      queryObj: { userName },
      repeatMsg: '用户名已被使用',
      createObj: {
        userName,
        password: encrypt,
        uid,
      },
    })
  ) {
    await setCookie({ ctx, uid, userName });

    ctx.status = 302;
    ctx.body = { redirectUrl: '/dashboard' };
  }
});

module.exports = router.routes();
