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
        skip_confirmation: true,
      },
    });

    return res;
  },

  // project
  async getUserProjects({ id }) {
    const res = await req({
      url: `users/${id}/projects`,
      method: 'get',
      data: {
        type: 'Project',
      },
    });

    return res;
  },

  async getUserOfProject({ id, user_id }) {
    const res = await req({
      url: `/projects/${id}/members/${user_id}`,
      method: 'get',
    });

    return res;
  },

  async addUserToProject({ id, user_id, access_level }) {
    const res = await req({
      url: `projects/${id}/members`,
      method: 'post',
      data: {
        user_id,
        access_level,
      },
    });

    return res;
  },

  async editUserInProject({ id, user_id, access_level }) {
    const res = await req({
      url: `projects/${id}/members/${user_id}`,
      method: 'put',
      data: {
        access_level,
      },
    });

    return res;
  },

  async removeUserFromProject({ id, user_id }) {
    const res = await req({
      url: `projects/${id}/members/${user_id}`,
      method: 'delete',
    });

    return res;
  },
};
