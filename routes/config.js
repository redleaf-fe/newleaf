const Router = require('koa-router');
const { Database } = require('../services');
const { toPromise } = require('../utils');
const { database } = require('../env.json');

const router = new Router();

const tables = ['Users', 'AppList'];

router.get('/get-tables', async (ctx) => {
  // const [err, rows] = await toPromise(
  //   Database.queryDatabase({ ctx, name: database }),
  // );
  // if (err) {
  //   ctx.body = JSON.stringify({ message: '查询数据库失败' });
  //   // return;
  // }

  // if (rows.length <= 0) {
  //   const [err2] = await toPromise(
  //     Database.createDatabase({ ctx, name: database }),
  //   );
  //   if (err2) {
  //     ctx.body = JSON.stringify({ message: '创建数据库失败' });
  //     // return;
  //   }
  // }

  const [err3] = await toPromise(Database.useDatabase({ ctx, name: database }));
  // if (err3) {
  //   ctx.body = JSON.stringify({ message: '使用数据库失败' });
  // }

  ctx.body = 'xxx';

  // for (let i = 0, len = tables.length; i < len; i++) {
  //   const tableName = tables[i];
  //   const [err4, rows4] = await Database.queryTable({ ctx, name: tableName });
  //   if (err4) {
  //     ctx.body = JSON.stringify({ message: `查询表${tableName}失败` });
  //     return {};
  //   }

  //   if (rows4.length <= 0) {
  //     const [err5] = await toPromise(
  //       Database.createTable({ ctx, name: tableName }),
  //     );
  //     if (err5) {
  //       ctx.body = JSON.stringify({ message: `创建表${tableName}失败` });
  //       return;
  //     }
  //   }
  // }

  // ctx.body = JSON.stringify({ message: `数据库初始化完成` });
});

module.exports = router.routes();
