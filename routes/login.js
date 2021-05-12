const Router = require('koa-router');
const crypto = require('crypto');
const { salt } = require('../env.json');
const { IdGenerate } = require('../services');

const router = new Router();

router.get('/login', async (ctx) => {
  const { userName, password } = ctx.request.body;

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');
  const res = await ctx.conn.models.user.findAll({
    where: { name: userName },
  });

  console.log(res);

  ctx.redirect('/#/dashboard');
});

router.get('/register', async (ctx) => {
  const { userName, password } = ctx.request.body;

  const sha256 = crypto.createHash('sha256');
  const encrypt = sha256.update(password + salt).digest('base64');

  const uid = await IdGenerate.idGenerate({
    conn: ctx.conn,
    modelName: 'user',
  });
  console.log(uid, 'uid');

  const res = await ctx.conn.models.user.create({
    name: userName,
    password: encrypt,
    appList: '',
    uid,
  });

  console.log(res, 'res');

  ctx.redirect('/#/dashboard');
});

module.exports = router.routes();
