const req = require('./req');

module.exports = {
  async createProject({ name, description }) {
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

  // async updateGroup({ id, name, description }) {
  //   const res = await req({
  //     url: `groups/${id}`,
  //     method: 'put',
  //     data: {
  //       name,
  //       description,
  //     },
  //   });

  //   return res;
  // },

  // async getGroupDetail({ id }) {
  //   const res = await req({
  //     url: `groups/${id}`,
  //     method: 'get',
  //     data: {
  //       id,
  //     },
  //   });

  //   return res;
  // },

  // async getGroupMembers({ id, page, per_page }) {
  //   const res = await req({
  //     url: `/groups/${id}/members`,
  //     method: 'get',
  //     data: {
  //       page,
  //       per_page,
  //     },
  //   });

  //   return res;
  // },

  async shareProjectWithGroup({ group_access, group_id }) {
    const res = await req({
      url: `/projects/${id}/share`,
      method: 'post',
      data: {
        group_access,
        group_id,
      },
    });

    return res;
  },

  async delShareProjectWithGroup({ id, group_id }) {
    const res = await req({
      url: `/projects/${id}/share/${group_id}`,
      method: 'delete',
    });

    return res;
  },
};
