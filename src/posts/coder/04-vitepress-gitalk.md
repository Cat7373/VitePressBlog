# 通过 Gitalk 为 VitePress 增加评论功能

最近用 VitePress 重新搭建了博客，但它目前未自带评论支持，网上搜了搜，有些文章教如何用 Gitalk 添加评论功能，但附带的代码吧，看起来作者都不大熟 Vue，多没法使用；

为了路过朋友少掉头发，参考 [Gitalk 官方文档](https://github.com/gitalk/gitalk/blob/master/readme-cn.md)，集成了评论插件，在此附上攻略。



## 创建 Github 仓库 + OAuth 应用

网上遍地是教程，大致是[创建 Github 仓库](https://github.com/new)用于存储评论，然后[创建 OAuth 应用](https://github.com/settings/applications/new)用于登陆和调接口；

可以自己搜索，关键词 gitalk 即可，不需要加 vitepress，随便附几篇，不赘述：

https://richard-docs.netlify.app/blogs/b-027

https://juejin.cn/post/7146037234527895560

https://blog.csdn.net/qq_30317039/article/details/132427910



## 集成 Gitalk

1. 运行 `npm i gitalk vue -D` 安装必要依赖；

2. 在 `.vitepress` 目录中创建一个 `theme` 目录，内创建 `index.ts` 文件，用自己的 Layout 替换默认的 Layout，文件内容：

   ```js
   import type { Theme } from 'vitepress'
   import DefaultTheme from 'vitepress/theme'
   import GitalkLayout from './layout/GitalkLayout.vue'

   import 'gitalk/dist/gitalk.css'

   const theme: Theme = {
     ...DefaultTheme,
     Layout: GitalkLayout
   }

   export default theme
   ```

3. 在 `theme` 目录中创建一个 `layout` 目录，内创建 `GitalkLayout.vue` 文件，文件内容：

   ```html
   <template>
     <Layout>
       <template #doc-after>
         <div v-if="initGitalkStep" id="gitalk-container"></div>
       </template>
     </Layout>
   </template>

   <script lang="ts" setup>
   import { useRoute } from 'vitepress'
   import Theme from 'vitepress/theme'
   import { ref, watch, onMounted, nextTick } from 'vue'
   import Gitalk from 'gitalk'

   const { Layout } = Theme
   const route = useRoute()
   // 当前加载状态
   // 0 DOM 中无元素，此时调用应将元素插入到 DOM 中，等下个 step 再加载
   // 1 DOM 中有元素，此时调用应用已有 DOM 元素初始化评论插件，加载后步骤完成，不需要再做什么了
   // 2 插件已经加载，此时调用应是切换页面了，应删除页面中的 DOM 元素，等下个 step 再插入
   const initGitalkStep = ref(0)

   const initGitalk = () => {
     // 切换页面时，刷新评论组件
     switch (initGitalkStep.value) {
       case 0: // DOM 中无元素，此时调用应将元素插入到 DOM 中，等下个 step 再加载
         initGitalkStep.value = 1
         nextTick(initGitalk)
         return
       case 1: // DOM 中有元素，此时调用应用已有 DOM 元素初始化评论插件，加载后步骤完成，不需要再做什么了
         initGitalkStep.value = 2
         break
       case 2: // 插件已经加载，此时调用应是切换页面了，应删除页面中的 DOM 元素，等下个 step 再插入
         initGitalkStep.value = 0
         nextTick(initGitalk)
         return
     }

     // 创建评论组件
     const gitTalk = new Gitalk({
       // GitHub 账号 <==== 按你的实际情况修改 ====>
       owner: 'Cat7373',
       // 仓库名 <==== 按你的实际情况修改 ====>
       repo: 'VitePressBlog',
       // 客户端 ID <==== 按你的实际情况修改 ====>
       clientID: '7e893f940e4723d2af60',
       // 客户端密钥 <==== 按你的实际情况修改 ====>
       clientSecret: 'b5336eb0b13e2b09d26bc6f7fc84752c7c104db3',
       // Github 账号 <==== 按你的实际情况修改 ====>
       admin: [ 'Cat7373' ],
       // 创建 Issue 时，为 Issue 增加的标签
       labels: [ 'GitTalk' ],
       // 如果 Issue 不存在，且登陆的是管理员账号，是否显示创建 Issue 按钮
       createIssueManually: true,
       // 创建 Issue 时，用于唯一标识这篇文章的标记
       id: location.pathname,
       // 撰写评论时，给一个全屏遮罩，聚焦到评论框
       distractionFreeMode: true,
     })
     // 渲染到 DOM 元素中
     gitTalk.render('gitalk-container')
   }

   // 初始化和页面切换时加载评论插件
   onMounted(initGitalk)
   watch(
     () => route.path,
     initGitalk,
   )
   </script>
   ```

4. 修改 `GitalkLayout.vue` 中的五个配置项，完活；

5. 可直接 copy [我的集成代码](https://github.com/Cat7373/VitePressBlog/tree/main/src/.vitepress/theme)，改下配置即可。
