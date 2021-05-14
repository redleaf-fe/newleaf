module.exports = {
  toPromise(promise) {
    return promise
      .then((data) => {
        return [null, data];
      })
      .catch((err) => [err]);
  },
  // 参数校验
  validate({ ctx, schema, obj }) {
    const errors = schema.validate(obj);
    if (errors.length > 0) {
      ctx.status = 400;
      ctx.body = JSON.stringify({ message: errors[0].message });
      return false;
    }
    return true;
  }
};
