function hello(ctx) {
  const { user } = ctx.request.query;
  ctx.ok({user});
}

module.exports = {
  hello,
};
