## 介绍

### newleaf 是什么？

newleaf 是一套应用服务软件，目前包括中心服务、发布、日志等部分，每个部分的都可以进行替换

### 起步

```
// clone newleaf工程到本地
git clone https://github.com/redleaf-fe/newleaf.git

// 安装依赖
yarn
或
npm i
```

newleaf 使用 sequelize 进行数据库操作，默认使用 mysql 数据库，可以进行替换，具体可查看 [sequelize 文档](https://github.com/sequelize/sequelize)

对 newleaf 目录下的 env.json 文件进行配置（数据库需要自己安装）

```
{
  // 中心服务监听端口
  "serverPort": 3012,
  // 开发环境，会输出一些日志，实际使用时应该设置为false
  "dev": true,

  // 中心服务对应的数据库配置
  // 数据库host，一般是localhost
  "databaseHost": "localhost",
  // 数据库用户名
  "databaseUserName": "root",
  // 数据库密码
  "databasePassword": "123456",
  // 数据库的名称
  "databaseName": "newleaf",
  // 数据库端口号
  "databasePort": 3306,

  // 中心服务登录session有效时长
  "sessionValidTime": 86400000,
  // 中心服务登录密码的salt
  "salt": "newleaf",
  // 中心服务sign cookie所用的key
  "keys": "this_is_a_newleaf,this_is_another_leaf",

  // 日志部分的数据库配置
  "logDatabaseHost": "localhost",
  "logDatabaseUserName": "root",
  "logDatabasePassword": "123456",
  "logDatabasePort": 3306,
  "logDatabaseName": "newleaf_log"
}

```

### 注意

建议中心服务和发布、日志等部分分开部署，因为日志、发布等部分所负责的功能都对资源有所要求，同时可以避免互相影响
