const _chunk = require('lodash/chunk');

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
      ctx.body = { message: errors[0].message };
      return false;
    }
    return true;
  },
  // 搜索分页
  searchAndPage({ data, currentPage, pageSize, search, searchKey }) {
    const ret = data.filter((v) => v[searchKey].includes(search));
    return {
      data: _chunk(ret, pageSize)[currentPage - 1],
      total: ret.length,
    };
  },
};
