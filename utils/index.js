const os = require('os');
const { promisify } = require('util');
const _chunk = require('lodash/chunk');

function getIPAddress() {
  const interfaces = os.networkInterfaces();
  let address;
  Object.keys(interfaces).some((v) => {
    const iface = interfaces[v];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        address = alias.address;
        return true;
      }
    }
    return false;
  });
  return address;
}

const IPAddr = getIPAddress();

module.exports = {
  toPromise(promise) {
    return promise
      .then((data) => {
        return [null, data];
      })
      .catch((err) => [err]);
  },
  // redis promisify
  redisPromisify(client) {
    client.existsAsync = promisify(client.exists).bind(client);
    client.getAsync = promisify(client.get).bind(client);
    client.setAsync = promisify(client.set).bind(client);
    client.mgetAsync = promisify(client.mget).bind(client);
    client.hsetAsync = promisify(client.hset).bind(client);
    client.hgetallAsync = promisify(client.hgetall).bind(client);
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
  // 本机ip
  IPAddr,
};
