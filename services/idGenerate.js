const { nanoid } = require('nanoid');

module.exports = {
  async idGenerate({ conn, modelName }) {
    const res = await conn.models[modelName].findAll({
      where: { uid: 1 },
    });

    console.log(res, 'id')

    return 1
  },
};
