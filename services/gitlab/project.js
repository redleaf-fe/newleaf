const req = require('./req');

module.exports = {
  async createProject({ name, description }) {
    const res = await req({
      url: 'projects',
      method: 'post',
      data: {
        name,
        path: name,
        description,
      },
    });

    return res;
  },

  async updateProject({ id, name, description }) {
    const res = await req({
      url: `projects/${id}`,
      method: 'put',
      data: {
        name,
        description,
      },
    });

    return res;
  },

  async getProjectDetail({ id }) {
    const res = await req({
      url: `projects/${id}`,
      method: 'get',
      data: {
        id,
      },
    });

    return res;
  },

  async getProjectMembers({ id }) {
    const res = await req({
      url: `/projects/${id}/members`,
      method: 'get',
    });

    return res;
  },

  // 分组
  async shareProjectWithGroup({ id, group_access, group_id }) {
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

  // 分支
  async getProjectBranch({ id }) {
    const res = await req({
      url: `/projects/${id}/repository/branches`,
      method: 'get',
    });

    return res;
  },

  // 提交
  async getBranchCommit({ id, ref_name }) {
    const res = await req({
      url: `projects/${id}/repository/commits`,
      method: 'get',
      data: {
        ref_name,
      },
    });

    return res;
  },
};
