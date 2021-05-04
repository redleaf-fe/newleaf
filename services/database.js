module.exports = {
  //
  async queryDatabase({ ctx, name }) {
    return await ctx.conn.execute(
      `select * from information_schema.SCHEMATA where SCHEMA_NAME = '${name}'`,
    );
  },
  async createDatabase({ ctx, name }) {
    return await ctx.conn.execute(`create database '${name}'`);
  },
  async useDatabase({ ctx, name }) {
    return await ctx.conn.execute(`use ${name}`);
  },
  //
  async queryTable({ ctx, name }) {
    return await ctx.conn.execute(
      `select * from information_schema.TABLES where TABLE_NAME = '${name}'`,
    );
  },
  async createTable({ ctx, name }) {
    return await ctx.conn.execute(`create table '${name}'`);
  },
};
