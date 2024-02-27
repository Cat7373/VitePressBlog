# PM2 环境下自动更新的坑

太长不看篇：

在 pm2 配置文件设置 `treekill: false`，就能保住负责重启的子进程的命。



## 背景

公司项目，在数十台海外 Windows 10 VPS 部署，每台机器用 pm2 管理数个 Puppeteer + Chrome 浏览器；

项目升级频繁，一台台连远程桌面，顶着海外高 ping 卡卡的操作，来一次就伤筋动骨；

为节约宝贵的脑资源，用到更有价值的地方，想做一个自动部署机制，点下按钮批量升级，代替人工劳动；

看 pm2 文档的部署机制，似乎只适用 Linux + SSH 服务器，于是想干脆用项目本身，给它发个指令，让它自己更新自己吧；



## 问题

说干就干，十分钟搞定，本地测试顺利，收到指令，运行 `git pull`、`pnpm i`，然后自杀，等 pm2 重启就完事了；

```js
// 运行 git pull 更新代码
const out1 = child_process.execSync('git pull').toString('utf8')
useLog().info('UpgradeCode', `更新代码输出: ${out1}`)

// 判定是否更新到代码，需要重启
const needRestart = !out1.includes('up to date.')

if (needRestart) { // 如果更新到代码，自动退出，通过 pm2 重启
  // 返回结果
  useWS().resp().success('更新到代码，正在重启升级').send()

  // 运行 pnpm i
  const out2 = child_process.execSync('pnpm i').toString('utf8')
  useLog().info('UpgradeCode', `安装依赖输出: ${out2}`)

  // 自杀，等待 pm2 重启
  process.exit(0)
} else { // 如果没更新到代码，返回错误
  useWS().resp().fail('更新到代码，未更新到代码').send()
}
```


到正式部署，碰到问题了，服务器只有一套代码，用 pm2 批量启动多个实例，通过不同配置文件区分，这样 10 个服务同时在一套代码上运行 `git pull` 跟 `pnpm i`，各种冲突，有时互相占用，有时部分服务更新代码时，代码已经更新过了，认为不需要升级；

那怎么办呢，不自杀了吧，让中控服务这边控制下，每台机器随机选一个服务下发升级指令，让它更新完代码，负责重启所有服务就好嘛；

好的，噩梦开始，把自杀换成运行 `pm2 restart all` 后，不论什么姿势，都只能重启部分服务，极端情况只能重启自己一个服务；



## 临时方案

经反复排查，认为是运行 `pm2 restart all` 后，当前服务为了重启被杀，导致 `pm2 restart all` 作为子进程一并被杀，这重启到了一半就挂掉了；

然后负责重启的服务被杀，又没起来，`pm2` 认为服务崩溃，又把它拉了起来，相当于完成了当前服务的重启；

之后就是漫长的测试、查文档、Google、StackOverflow、GPT 之旅，一直沿着父进程死掉怎么保活子进程的思路查查查；

直到一次，运行 `bash -c "sleep 10 && pm2 restart all"` 然后服务直接自杀后，所有服务重启成功了！

```js
// 运行 git pull 更新代码
const out1 = child_process.execSync('git pull').toString('utf8')
useLog().info('UpgradeCode', `更新代码输出: ${out1}`)

// 判定是否更新到代码，需要重启
const needRestart = !out1.includes('up to date.')

if (needRestart) { // 如果更新到代码，自动退出，通过 pm2 重启
  // 返回结果
  useWS().resp().success('更新到代码，正在重启升级').send()

  // 运行 pnpm i
  const out2 = child_process.execSync('pnpm i').toString('utf8')
  useLog().info('UpgradeCode', `安装依赖输出: ${out2}`)

  // 使用 pm2 进行重启
  child_process.spawn('bash', [ '-c', '"sleep 10 && pm2 restart all"' ], {
    shell: true,
    detached: true,
    stdio: 'ignore',
  }).unref()

  // 自杀，等待 pm2 重启
  process.exit(0)
} else { // 如果没更新到代码，返回错误
  useWS().resp().fail('更新到代码，未更新到代码').send()
}
```

有希望！但方案不完美，因为服务自杀，会重启一次，然后很快又迎来 `pm2 restart all` 又重启一次，而且写死一个 10s，总是又慢又不稳定。



## 找到原因

看看场上局面，意识到问题可能在 pm2，因为进程自杀后，进程间父子关系被打断，子进程就能存，简简单单的注释一行自杀代码，子进程就挂了，估计是 pm2 在杀服务的时候，直接干掉了所有子进程。

于是继续查查查，看 pm2 文档，[优雅退出](https://pm2.keymetrics.io/docs/usage/signals-clean-restart)这篇是这么说的：

```js
process.on('SIGINT', function() {
   db.stop(function(err) {
     process.exit(err ? 1 : 0)
   })
})
```

是的，让你接一下事件，然后在 1.6s 内自己清理资源并退出，感觉希望来了呀！我在这儿直接干干净净得自杀，不就相当于告诉 pm2，我清理完资源了，不需要你干啥了嘛 hhhh

```js
process.on('SIGINT', function() {
  // 啥也别干，第一时间干脆利落的自杀掉
  process.exit(0)
})
```

然而现实很... 总之子进程还是被杀掉了，[配置文档](https://pm2.keymetrics.io/docs/usage/application-declaration/)里也没找到相关的资料。

于是还得继续查查查呀，偶然搜到一篇 [Issue](https://github.com/Unitech/pm2/issues/1036)，顿觉找到原因！他说的情况跟我遇到的一样一样的！

这篇 Issue 中，官方说会加个配置来解决，pm2 的配置文档反复看过好几次，没找到相关配置，只好绝望的去全仓库搜索 treekill，想看看它是怎么实现的，有无希望 hack 下绕过；

然后就搜到了这个：https://github.com/Unitech/pm2/blob/master/examples/treekill/process.json

是的！他们有这个配置！但文档里没提！！！官网似乎没有任何地方说明！！！你只有先知道配置的存在，然后来搜才能找到！！！这太扯了！！！我甚至没忍住在 Issue 底下留言了 shit！！！



## 解决方案

配置里加上 `treekill: false` 后，代码干净了，也不用自杀了，稳定高效：

```js
// 运行 git pull 更新代码
const out1 = child_process.execSync('git pull').toString('utf8')
useLog().info('UpgradeCode', `更新代码输出: ${out1}`)

// 判定是否更新到代码，需要重启
const needRestart = !out1.includes('up to date.')

if (needRestart) { // 如果更新到代码，自动退出，通过 pm2 重启
  // 返回结果
  useWS().resp().success('更新到代码，正在重启升级').send()

  // 运行 pnpm i
  const out2 = child_process.execSync('pnpm i').toString('utf8')
  useLog().info('UpgradeCode', `安装依赖输出: ${out2}`)

  // 使用 pm2 进行重启
  child_process.spawn('pm2', [ 'restart', 'all' ], {
    shell: true,
    detached: true,
    stdio: 'ignore',
  }).unref()
} else { // 如果没更新到代码，返回错误
  useWS().resp().fail('更新到代码，未更新到代码').send()
}
```



## 后记

问题解决后，我不死心呀，继续 google pm2 treekill，居然搜到一篇官方文档，提到这个配置，但官网没找到任何入口进这篇文档；

后发现，这是俩域名不一样，一个是 pm2  官网（Google 第一条，npmjs 中的 HomePage），一个是 pm2 Plus 官网，是他们的商业收费项目；

只有商业收费项目的文档里，才有完整的配置。。。

本次排查历时四小时有余，附上两份文档地址吧，希望能让某位后来者多保下两根发：

* [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start)
* [PM2 Plus 文档](https://pm2.io/docs/plus/overview/)

