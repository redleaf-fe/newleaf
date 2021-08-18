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
  // redis promisify
  redisPromisify(client) {
    [
      // 
      'ttl', 'exists', 'del', 'expire',
      // string
      'get', 'set', 'mget', 'getset',
      // list
      'lpush', 'lpop', 'lindex', 'lrange', 'llen', 'lrem', 'rpush', 'rpop',
      // set
      'sadd', 'scard', 'smembers', 'sismember', 'srem',
      // hash
      'hset', 'hget', 'hgetall', 'hdel', 'hexists', 'hkeys', 'hvals', 'hlen', 'hmget', 'hmset'
    ]
    .forEach(v=>{
      client[`${v}Async`] = promisify(client[v]).bind(client);
    });
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
      rows: _chunk(ret, pageSize)[currentPage - 1],
      count: ret ? ret.length : 0,
    };
  },
  // 本机ip
  IPAddr,
};
