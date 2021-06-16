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
  } else if (method === 'post') {
    param.data = data;
  }

  try {
    const res = await axios(param);
    return res;
  } catch (e) {
    return e;
  }
};
