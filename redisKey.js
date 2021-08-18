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
    return `newleaf_publish_server_${id}`;
  },
  publishedServer(id){
    return `newleaf_published_server_${id}`;
  },
  monitorKey: 'newleaf_monitor'
};
