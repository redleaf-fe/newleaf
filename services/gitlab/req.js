const axios = require('axios');
const config = require('../../env.json');

module.exports = async function ({ url, method = 'get', data = {} }) {
  const param = {
    baseURL: config.gitSeverPath,
    method,
    headers: { 'PRIVATE-TOKEN': config.gitToken },
    url,
  };

  if (method === 'get') {
    param.params = data;
  } else if (['post', 'put'].includes(method)) {
    param.data = data;
  }

  try {
    const res = await axios(param);
    res.total = res.headers['x-total'];
    return res;
  } catch (e) {
    return e;
  }
};
