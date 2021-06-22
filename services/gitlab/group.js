const req = require('./req');

module.exports = {
  async createGroup({ name, description }) {
    const res = await req({
      url: 'groups',
      method: 'post',
      data: {
        name,
        path: name,
        description,
      },
    });

    return res;
  },

  async getGroupProjects({ id, search, page, per_page }) {
    const res = await req({
      url: `/groups/${id}/projects`,
      method: 'get',
      data: {
        search,
        order_by: 'updated_at',
        page,
        per_page
      },
    });

    return res;
  },
};
