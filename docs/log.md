## newleaf-log

### newleaf-log 是什么？

newleaf-log 是 newleaf 的日志套件，用于日志的存储和读取

### 起步

```
// clone newleaf-log工程到本地
git clone https://github.com/redleaf-fe/newleaf-log.git

// 安装依赖
yarn
或
npm i

// 需要先安装数据库

// 启动服务
yarn dev
或
npm run dev
或
使用 pm2 等方式启动
```

使用日志服务需要在页面中加入脚本，newleaf 后台有“脚本生成”页面，生成日志脚本

日志和应用关联，所以使用日志前需要先创建应用，获取 appId 后，填入脚本生成页面的 appId 输入框中

上报地址指接收日志的接口地址，比如 newleaf-log 接收日志的接口地址为 http://localhost:3013/log，可以使用其他服务替换 newleaf-log，将相应服务的接口地址填入“日志上报地址”中即可

### 日志脚本基础功能

1. 日志上报

```
// 日志脚本会在window上挂载一个newleaf对象
newleaf.log({ content: JSON.stringify({ xxx: Math.random(), t: new Date() }) });
```

newleaf.log 方法的参数如下

| 参数    | 类型                                               | 默认值                      | 说明                                                                                                                           |
| ------- | -------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| type    | 'log'\| 'error' \| 'perf' \| 'visit' \| 'route' \| | 'log'                       | 日志类型，依次为通用日志、错误日志、性能日志、访问日志、路由日志                                                               |
| content | string                                             | ''                          | 如果为空字符串，不发送该条日志                                                                                                 |
| method  | 'xhr' \| 'img' \| 'beacon'                         | 'beacon'                    | 日志上报方式，xhr 使用 XMLHttpRequest 的 POST 方法上报，img 使用 new Image 方式上报，beacon 使用 navigator.sendBeacon 方法上报 |
| logUrl  | string                                             | 'http://localhost:3013/log' | 日志上报地址                                                                                                                   |
| appId   | string                                             | 无                          | 关联的应用 id                                                                                                                  |
| cache   | boolean                                            | true                        | 是否先缓存，再发送日志，如果为 false，立即发送该条日志                                                                         |

### 缓存

### 错误处理
