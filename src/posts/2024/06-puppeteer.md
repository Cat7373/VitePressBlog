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

直接用 Puppeteer 控制浏览器去访问，就像在网站面前脱裤子裸奔一样，毫无防御，对面随便一攻，我们就破了；

---

这是著名的[检测工具](https://bot.sannysoft.com)，它会检测一长串各类特征，把你没防御好，导致你裤子被脱的特征标红显示；

>  [这篇文章](https://cloud.tencent.com/developer/article/1755512)很好的演示了检测效果，但作者是个人才，标题党不说，所谓万里山河一片红，是因为 html 里大部分项目本就是红的，然后运行各种检测代码（大约零点几秒），没问题的再改成绿的，图上一片红，只能说明网页一加载完，他立马就截图了，根本没给工具检测的机会（我想喷很久了，在正常浏览器试，也会看到一片红一闪而过，然后变成全绿）；

现在来看两张无防护下的检测结果：

![](/uploads/iShot_2024-02-27_21.49.34.png)

![](/uploads/iShot_2024-02-27_21.48.55.png)

第一张来自普通浏览器，第二张来自 Headless 浏览器；

可以看到，均被检测到被自动程序控制，Headless 模式下 UA 里因为有 Headless 字样，也被检测出了；

---

那我们肯定不能脱裤子裸奔对吧，这时可以用反检测插件：

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

哎，万里山河一片绿对吧，成功通过检测。



### 浏览器指纹
TODO



