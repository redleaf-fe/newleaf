## 介绍

### newleaf 是什么？

newleaf 是一个前端工程为主体的研发平台，主要功能有打包、发布、日志、监控、源码反解等

目前的功能和整体结构如下图：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24ec41edf21f4290888319e68d67cca5~tplv-k3u1fbpfcp-watermark.image)

### 视频介绍

<video id="video" controls preload width="100%">
  <source id="mp4" src="http://redleaf.fun/api/static/newleaf.mp4" type="video/mp4">
</video>

### 起步

1. clone newleaf 工程，并安装依赖

```
git clone https://github.com/redleaf-fe/newleaf.git

// 安装依赖
yarn
或
npm i
```

2. 安装 mysql、redis 和 gitlab，并启动服务。mysql 建议使用 5.7.x 版本，redis 建议使用 5.0.x 版本，gitlab 建议使用 10.2.x 版本。建议将 mysql 和 redis 部署为单独的存储服务，使其他服务都可访问。

3. 对 newleaf 的相关参数进行配置，newleaf 的配置项保存在 env.json 文件中。newleaf 创建用户、创建应用等操作涉及 gitlab 的数据操作，所以要提供 gitlab 的 root 账号的 Access Token

```

{
  // 开发环境标识，设置为 true 会输出一些日志，实际使用时应设置为 false
  "dev": true,
  // 中心服务监听端口
  "serverPort": 3012,
  // 数据库 host
  "databaseHost": "xx.xx.xx.xx",
  // 数据库用户名
  "databaseUserName": "root",
  // 数据库密码
  "databasePassword": "123456",
  // 数据库的名称
  "databaseName": "newleaf",
  // 数据库端口号
  "databasePort": 3306,
  // redis host
  "redisHost": "xx.xx.xx.xx",
  // redis 端口号
  "redisPort": 6379,
  // 中心服务登录 session 有效时长，单位：秒
  "sessionValidTime": 86400,
  // 中心服务登录密码的 salt
  "salt": "newleaf",
  // 中心服务 sign cookie 所用的 key
  "keys": "this_is_a_newleaf,this_is_another_leaf",
  // 日志查询服务的请求接口地址
  "logServer": "http://xx.xx.xx.xx:3013/get",
  // gitlab 服务的域名
  "gitServer": "http://xx.xx.xx.xx:9980",
  // gitlab 的 root 账号 Access Token
  "gitToken": "abcdefg",
  // 打包结果存放路径，打包后会回传结果到中心服务进行处理
  "appDir": "/Users/newleaf"
}

```

4. 启动服务，建议使用 pm2 等方式

```
yarn dev
或
npm run dev
或
使用 pm2 等方式启动
```

此时可以进行用户注册、创建应用、应用管理等操作，打包、发布、日志等功能请继续阅读后续章节
