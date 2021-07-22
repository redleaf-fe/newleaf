const Router = require('koa-router');
const crypto = require('crypto');
const Schema = require('validate');

const { salt, sessionValidTime } = require('../env.json');
const redisKey = require('../redisKey');
const { idGenerate, nanoid, findRepeat } = require('../services');
const { validate } = require('../utils');

const router = new Router();

const cookieConfig = {
  signed: true,
  maxAge: sessionValidTime * 1000,
  httpOnly: true,
};

const baseSchema = {
  username: {
    type: String,
    required: true,
    length: { min: 4, max: 20 },
    match: /^[a-zA-Z0-9_]+$/,
    message: {
      required: '用户名必填',
      length: '用户名需要4到20字符之间',
      match: '只支持数字、英文、和_',
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
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    message: {
      required: '邮箱必填',
      match: '邮箱格式不正确',
      length: '邮箱长度小于100',
    },
  },
});

async function setCookie({ ctx, uid, gitUid, username }) {
  const infoKey = redisKey.loginInfo(uid);

  const res = await ctx.redis.hgetallAsync(infoKey);
  // 判断是否已经登录过
  if (!res) {
    // 生成登录token
    const token = await getToken();

    const tokenKey = redisKey.loginTokenUid(token);
    await ctx.redis.hsetAsync(
      infoKey,
      'gitUid',
      gitUid,
      'username',
      username,
      'loginToken',
      token
    );
    await ctx.redis.setAsync(tokenKey, uid);

    ctx.redis.expire(infoKey, sessionValidTime * 1000);
    ctx.redis.expire(tokenKey, sessionValidTime * 1000);

    ctx.cookies.set('token', token, cookieConfig);
    ctx.cookies.set('username', username, { httpOnly: false });
  }

  async function getToken() {
    let token = nanoid();
    let res = await ctx.redis.existsAsync(redisKey.loginTokenUid(token));

    while (+res) {
      token = nanoid();
      res = await ctx.redis.existsAsync(redisKey.loginTokenUid(token));
    }

    return token;
  }
}

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  if (!validate({ ctx, schema: loginSchema, obj: { username, password } })) {
    return;
  }

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');
  const res = await ctx.seq.models.user.findOne({
    attributes: ['password', 'uid', 'gitUid', 'username'],
    where: { username },
  });

  if (res) {
    // 校验密码
    if (res.password === encrypt) {
      await setCookie({
        ctx,
        uid: res.uid,
        gitUid: res.gitUid,
        username: res.username,
      });

      ctx.status = 302;
      ctx.body = { redirectUrl: '/page/dashboard' };
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
    const uid = await idGenerate({
      ctx,
      modelName: 'user',
      idName: 'uid',
    });
    const gitUid = res.data.id;
    const sha256 = crypto.createHash('sha256');
    const encrypt = sha256.update(password + salt).digest('base64');

    await ctx.seq.models.user.create({
      username,
      password: encrypt,
      uid,
      gitUid,
      email,
    });

    await setCookie({ ctx, uid, gitUid, username });

    ctx.status = 302;
    ctx.body = { redirectUrl: '/page/dashboard' };
  } else {
    ctx.status = 400;
    ctx.body = { message: res.response.data.message };
  }
});

module.exports = router.routes();
