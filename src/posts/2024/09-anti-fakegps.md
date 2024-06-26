# 基于网页的反模拟定位方案

## 1. 前言

在开发基于定位的应用时，常遇到用户使用[Fake GPS](https://play.google.com/store/apps/details?id=com.blogspot.newapphorizons.fakegps)、[Fake GPS location](https://play.google.com/store/apps/details?id=com.lexa.fakegps)等模拟定位软件作弊的情况，在巡逻拍照、考勤打卡等场景，我们可能需要考虑防御；

在网上搜索，发现绝大部分定位反作弊，均在讨论开发 app 时，如何通过应用列表、系统 API 字段、WI-FI 等进行检测，深一些的还会讨论拿到 root 权限后的做法；

但在网页环境，上述方案基本无用，因为网页没有权限访问本地数据，更不用提 root 或越狱了；

在掉了数百根头发后，我们找到一种基于定位数据分析的反作弊方案，并封装为 [npm 包](https://www.npmjs.com/package/anti-fakegps)，便于同行们节约发量（[手机端演示](https://cat7373.github.io/Anti-FakeGPS)）；

本文只讨论移动端检测，因为 PC 极少配备 GPS 硬件，定位多通过 IP 等推测得出，本就不准确，在前述场景，也几无反作弊意义。



## 2. 正常的 GPS 轨迹是怎样的

GPS 位置是由手机接收几颗卫星的信号，获得设备到几颗卫星的通讯时间，然后通过算法推算得出手机在地球上的位置；

因卫星和地球的相对位置关系不可能完全不变，手机的数据处理也存在极小的时间误差，且军用级 GPS 最小误差都有 30cm 左右，因此手机即便是在原地不动，其 GPS 位置也一定是不断变化的；

在原地静止时，根据手机性能，其变化范围一般在 1m ~ 50m，绝大部份现代手机在室外应能做到 10m 以内，在移动时，根据移动速度，其变化范围会更大；

用手上的两个手机实测，可以支持上述结论。



## 3. 模拟定位软件存在什么漏洞

在测试数个安卓模拟定位 App，及 iOS 通过电脑模拟定位，及网页通过开发者工具模拟定位后发现，绝大部分模拟定位软件，是将位置设置到某个点，然后不再变动，这是非常明显的特征，从前文可知，正常定位中，GPS 位置不可能一直不变；

基于这个特征，我们可以轻松干掉市面上绝大部分模拟定位软件，当然，市面上还有 [AnyGo](https://itoolab.tw/guide/how-to-use-anygo) 这种可以模拟轨迹的方案，在特定场景中，其实仍可防御，后面细说。



## 4. 如何在网页检测模拟定位

考虑几个常见的用户使用模拟定位的场景：



### 4.1. 普通模拟定位软件

1. 先打开模拟定位，再访问网页

   这种情况下，网页打开后首次拿到的，就是假位置，后续位置不再变化。

2. 先访问网页，再打开模拟定位

   这种情况下，网页会先拿到真位置，在用户打开模拟定位后，网页才会拿到假位置，这个位置较上一次，会出现大幅移动，同时后续位置不再变化。



基于上述场景，容易构建算法：

1. 设置一个检测中的状态，认为位置存疑时，就改为这个状态，因模拟定位软件只会更新一次位置，因此在连续获取到几次位置变化时，才认为位置可信，可以使用，在位置还没准备好时，应提示用户正在定位，请稍等
2. 首次获取到定位，因不知真假，所以应将状态置为检测中，这样能应对第一种情况
3. 定位突然发生大幅移动（如 2-3 秒内，变动 5km），明显不正常，将状态置为检测中，这样能应对第二种情况
4. 设定一个定时器，如 0.5s 执行一次，连续数个周期没有执行，视为网页被切换到后台，用户可能去做其他操作了（是的，可能是打开模拟定位！），将状态置为检测中，作为可选的补充手段



现代手机一般 1-2 秒变更一次位置，检测到数次变动，一般在 5s 以内，在绝大部分场景下，不会影响用户体验。



### 4.2 AnyGo 类模拟轨迹的软件

像 [AnyGo](https://itoolab.tw/guide/how-to-use-anygo) 这类软件，可以自定义一段轨迹，这样轨迹就是不停移动的，4.1 中的检测方式就失灵了，不过对于巡逻拍照、考勤打卡这种场景，还是可以多多少少的做一些防御的：

这类场景，需要在特定地点操作，可以保存操作前一段时间的 GPS 轨迹，判断是在原地不动，仅因为 GPS 误差小范围漂移，还是在移动，如在路上行走，然后要求其在目标地点停留至少几十秒，才能正常提交。



## 5. 检测代码示例

基于上述逻辑，我们开发了 [Anti-FakeGPS](https://www.npmjs.com/package/anti-fakegps)，[使用演示](https://cat7373.github.io/Anti-FakeGPS)代码如下：

```ts
import { useAntiFakeGPS } from 'anti-fakegps'

/**
 * 当点击提交按钮时
 */
async function submit() {
  // 获取检测结果
  const checkResult = useAntiFakeGPS().check()

  // 根据检测结果，决定下一步操作
  switch (checkResult.status) {
    // 正在定位和正在检测时，提示用户正在定位，请稍等
    case CheckResult.POSITIONING: // 正在定位
    case CheckResult.CHECKING: // 正在检测
      showToast({ type: 'warning', message: '正在定位，请稍等...' })
      return
    // 定位失败时，提示用户打开手机定位开关，并允许网页定位
    case CheckResult.POSITION_FAILED: // 定位失败
      showToast({ type: 'warning', message: '请打开手机定位开关，并允许网页定位，再使用此功能' })
      return
    // 定位间隔超出正常范围时，视为正在使用模拟定位
    case CheckResult.LONG_TIME_NOT_UPDATE:
      // 在服务器记录违规行为
      // await saveCheatRecord({ uid: 'xxx' })

      showConfirmDialog({ title: '警告', message: '请勿使用模拟定位等作弊软件，本次行为已被记录，如果你确实在项目现场，可继续操作，公司会二次排查，确认要继续么？' })
      return
  }

  // 对于巡查定点拍照的场景，可以要求其停留在原地才能使用拍照功能，以应对 AnyGo 类软件
  // 判断手机正在移动，而不是停留在原地
  if (checkResult.pathMoved()) {
    showNotify({ type: 'warning', message: '请在原地稍等一会再拍照...' })
    return
  }

  // TODO 进行具体业务操作...
  // 可使用 checkResult.longitude 和 checkResult.latitude 获取经纬度

  showNotify({ type: 'success', message: '操作成功' })
}
```



## 6. 盘外招

技术不能解决所有问题，尤其是网页环境，权限有限，是能是提高作弊成本，避免用户随便找个阿猫阿狗的就把定位改了；

实际业务中，完全可以学钉钉的盘外招：检测到作弊直接高优先级通知到 HR，后面上纲上线、领导约谈、警告降薪、取消奖金、不得评优、降级开除、倒查考核、内部通报等一套组合拳，高压遏制，避免用户反复尝试哪种模拟定位技术能绕过检测；

技术是一部分，吓唬是一部分，处罚也是一部分，组合一起用，效果才比较好。



## 7. 一些问题

### 7.1 手机在原地不动一分钟，也会检测为模拟定位

手机开着 GPS 芯片，比较费电，所以手机都会做优化，手机没动（陀螺仪等数据几无变化），一段时间自动关闭 GPS 芯片，持续使用之前缓存的经纬度；

而在现场拍照场景中，用户拿着手机找角度拍照，手机陀螺仪数据不可能完全不动，所以实际使用中，不会出现这种问题，只有坐办公室测试才会遇到。

### 7.2 有哪些手段能绕过检测？

TODO



## 8. 放弃的方案

TODO



## 9. 无法使用的方案

TODO

