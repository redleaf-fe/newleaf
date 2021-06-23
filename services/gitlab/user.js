const req = require('./req');

module.exports = {
  async createUser({ username, email, password }) {
    const res = await req({
      url: 'users',
      method: 'post',
      data: {
        username,
        name: username,
        email,
        password,
      },
    });

    return res;
  },

  async getUserGroups({ id, search, page, per_page, order_by }) {
    const res = await req({
      url: `users/${id}/memberships`,
      method: 'get',
      data: {
        type: 'Namespace',
        order_by: order_by || 'updated_at',
        search,
        page,
        per_page,
      },
    });

    return res;
  },

  async getUserOfGroup({ id, user_id }) {
    const res = await req({
      url: `/groups/${id}/members/${user_id}`,
      method: 'get',
    });

    return res;
  },

  async addUserIntoGroup({ group_id, user_id, access_level }) {
    const res = await req({
      url: `groups/${group_id}/members`,
      method: 'post',
      data: {
        user_id,
        access_level,
      },
    });

    return res;
  },

  async editUserInGroup({ group_id, user_id, access_level }) {
    const res = await req({
      url: `groups/${group_id}/members/${user_id}`,
      method: 'put',
      data: {
        access_level,
      },
    });

    return res;
  },

  async removeUserFromGroup({ group_id, user_id }) {
    const res = await req({
      url: `groups/${group_id}/members/${user_id}`,
      method: 'delete',
    });

    return res;
  },
};
