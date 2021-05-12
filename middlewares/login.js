const Cookie = require('cookie');

module.exports = async (ctx, next) => {
  // const cookie = Cookie.parse(ctx.req.headers.cookie);
  
  // console.log(Object.keys(ctx.req.headers));

  // ctx.conn.login.
  // if(cookie.name !== 'root'){
  //   ctx.redirect('/#/login')
  //   return;
  // }

  await next();
};
