const Router = require('koa-router');
const { Op } = require('sequelize');

const router = new Router();

router.get('/getByName', async (ctx) => {
  const { username } = ctx.request.query;

  if (username) {
    const res = await ctx.conn.models.user.findAll({
      attributes: ['uid', 'username'],
      where: { username: { [Op.like]: `%${username}%` } },
      order: ['username'],
    });
    ctx.body = res;
  } else {
    ctx.body = { message: 'username必填' };
  }
});

module.exports = router.routes();
