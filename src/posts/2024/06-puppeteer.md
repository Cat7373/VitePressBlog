# Puppeteer 随笔

开个坑，记录下使用 Puppeteer 的种种；

PS: Selenuim 太老了，强烈建议不要用它。



## 过检测

### 特征检测

默认配置下，Puppeteer 能被检测到很多特征，最著名的莫过于在控制台输入：

```js
navigator.webdriver
```

正常浏览器会返回 `false`，而被 Puppeteer 控制的浏览器会返回 `true`；

这是其中一个特征，还有其他很多特征，网站管理员依据这些特征，可决策是否禁止访问、封 IP、封号、风控、出验证码等，给我们造成麻烦，甚至损失（如交易网站封号）；

直接用 Puppeteer 控制浏览器去访问，就像在网站面前脱了裤子裸奔一样，毫无防御，对面随便一攻，我们就破了；

---

这其中有一个著名的[检测工具](https://bot.sannysoft.com)，它会检测一长串各类特征，把你没防御好，导致你暴露的特征标红显示；

>  [这篇文章](https://cloud.tencent.com/developer/article/1755512)很好的演示了检测效果，但作者是个人才，标题党不说，所谓万里山河一片红，是因为 html 里大部分项目本就是红的，然后运行各种检测代码（大约零点几秒），没问题的再改成绿的，图上一片红，只能说明网页一加载完，他立马就截图了，根本没给工具检测的机会（我想喷很久了，在正常浏览器试，也会看到一片红一闪而过，然后变成全绿）；

现在来看两张无防护下的检测结果：

![](/uploads/iShot_2024-02-27_21.49.34.png)

![](/uploads/iShot_2024-02-27_21.48.55.png)

第一张来自普通浏览器，第二张来自 Headless 浏览器；

可以看到，均被检测到被自动程序控制，Headless 模式下 UA 里因为有 Headless 字样，也被检测出了；

---

那我们肯定不能脱掉裤子裸奔对吧，这时可以用反检测插件：

1. 运行 `npm i puppeteer-extra puppeteer-extra-plugin-stealth puppeteer-extra-plugin-anonymize-ua` 安装依赖

2. 将你导入 puppeteer 的代码从 `import puppeteer from 'puppeteer'` 改为 `import puppeteer from 'puppeteer-extra'`

3. 在执行 `puppeteer.launch` 前，先用下面的代码安装插件：

   ```js
   puppeteer
     .use(AnonymizeUaPlugin())
     .use(StealthPlugin())
   ```

4. 浏览器启动后，默认会打开一个空白页，`AnonymizeUaPlugin` 插件默认似乎无法保护这个页面，因此在执行完 `puppeteer.launch` 后，使用下面的代码对这个页面进行保护：

   ```js
   // 获取默认创建的页面
   const [ page ] = (await browser.pages())
   
   // 设置这个页面的 UA
   AnonymizeUaPlugin().onPageCreated(page)
   ```

---

一切就绪，我们再检测一次：

![](/uploads/iShot_2024-02-27_22.08.59.png)

好了，万里山河一片绿，成功通过检测。



### 浏览器指纹
TODO



### IP 地址

TODO 代理配置参数

稳定性要求不高，量不大的，可以用梯子或 VPS 解决，需要一定配置工作：

* [一元机场 (便宜，IP 多)](https://xn--4gq62f52gdss.club/#/register?code=m3ZMtQDz)
* [JustMySocks (稳定)](https://justmysocks.net/members/aff.php?aff=158)
* [Vultr (注册送 $100)](https://www.vultr.com/?ref=9369190-8H)

稳定性要求高的，推荐几个买 IP 的地方，部分有免费试用（都挺贵，商用考虑吧）：

* [IPFoxy](https://referral.ipfoxy.com/RiHcWI)
* [StormProxies](https://www.stormproxies.cn)
* [Kookeey](https://www.kookeey.com)
* [SmartProxy](https://www.smartproxy.cn)



## 崩溃处理

浏览器呢是内存大户，内存不足时，容易优先被杀，维护人员也可能不注意关掉浏览器；

这样呢，我们的 js 代码就抓瞎了对吧，不管什么操作都抛异常，通常呢，代码又有异常处理，进程又不会崩溃；

这样控制进程就变成在控制虚空了，通常只好人工发现异常，登陆机器去处理；

那我们肯定不能这样对吧，得想办法发现出问题了，然后根据自己实际情况去处理：

```js
// 检测到浏览器退出或崩溃后，自杀，等 PM2 重启
browser.on('disconnected', () => {
  useLog().error('检测到浏览器退出或崩溃，自动退出')
  process.exit(1)
})
```

这是我用的检测代码，因为外面有 pm2，所以直接自杀，重新初始化就行了；

如果你的控制进程管理多个浏览器，也可以选择放弃这个浏览器，去重新创建，根据你的实际情况选择怎么处理就好了。

