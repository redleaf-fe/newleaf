const axios = require('axios');
const config = require('../../env.json');

module.exports = async function ({ url, method = 'get', data = {} }) {
  const param = {
    baseURL: `http://${config.gitServer}/api/v4/`,
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
    return res;
  } catch (e) {
    return e;
  }
};
