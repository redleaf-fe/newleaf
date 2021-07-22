module.exports = {
  loginInfo(uid) {
    return `newleaf_login_info_${uid}`;
  },
  loginTokenUid(token) {
    // token做key，uid做value
    return `newleaf_login_token_uid_${token}`;
  },
};
