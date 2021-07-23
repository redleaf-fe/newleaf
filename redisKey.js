module.exports = {
  deployChannel: "_newleaf_deploy_channel_",
  loginInfo(uid) {
    return `newleaf_login_info_${uid}`;
  },
  loginTokenUid(token) {
    // token做key，uid做value
    return `newleaf_login_token_uid_${token}`;
  },
  publishServer(id){
    return `publish_server_${id}`;
  },
  publishedServer(id){
    return `published_server_${id}`;
  }
};
