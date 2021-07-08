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
    const ret = search
      ? data.filter((v) => v[searchKey].includes(search))
      : data;
    return {
      data: _chunk(ret, pageSize)[currentPage - 1],
      total: ret ? ret.length : 0,
    };
  },
};
