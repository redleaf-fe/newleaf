const Router = require('koa-router');
const { Op } = require('sequelize');

const router = new Router();

router.get('/getByName', async (ctx) => {
  const { userName } = ctx.request.query;

  if (userName) {
    const res = await ctx.conn.models.user.findAll({
      attributes: ['uid', 'userName'],
      where: { userName: { [Op.like]: `%${userName}%` } },
      order: ['userName'],
    });
    ctx.body = res;
  } else {
    ctx.body = { message: 'userName必填' };
  }
});

module.exports = router.routes();
