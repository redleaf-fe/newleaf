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

  async updateGroup({ id, name, description }) {
    const res = await req({
      url: `groups/${id}`,
      method: 'put',
      data: {
        name,
        description,
      },
    });

    return res;
  },

  async getGroupDetail({ id }) {
    const res = await req({
      url: `groups/${id}`,
      method: 'get',
      data: {
        id,
      },
    });

    return res;
  },

  async getGroupMembers({ id }) {
    const res = await req({
      url: `/groups/${id}/members`,
      method: 'get',
    });

    return res;
  },

  async getGroupProjects({ id, order_by }) {
    const res = await req({
      url: `/groups/${id}/projects`,
      method: 'get',
      data: {
        order_by: order_by || 'name',
      },
    });

    return res;
  },
};
