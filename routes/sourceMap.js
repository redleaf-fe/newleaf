const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');

const config = require('../env.json');

const router = new Router();
const { SourceMapConsumer } = sourceMap;

router.get('/query', async (ctx) => {
  const { appName, commit, fileName, line, column } = ctx.request.query;

  const distPath = path.resolve(config.appDir, `${appName}-${commit}-dist`);

  if (fs.existsSync(distPath)) {
    const sourcemap = fs.readFileSync(
      path.resolve(distPath, 'js', `${fileName}.map`),
      'utf8'
    );

    const consumer = await new SourceMapConsumer(sourcemap);
    ctx.body = consumer.originalPositionFor({
      line: +line,
      column: +column,
    });
  } else {
    ctx.status = 500;
    ctx.body = { message: '未找到打包结果' };
  }
});

module.exports = router.routes();
