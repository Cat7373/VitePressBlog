<template>
  <div id="gitalk-page-container"></div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { inBrowser } from 'vitepress'
import Gitalk from 'gitalk'

const init = () => {
  if (inBrowser) {
    const gitTalk = new Gitalk({
      // GitHub 账号
      owner: 'Cat7373',
      // 仓库名
      repo: 'VitePressBlog',
      // 客户端 ID
      clientID: '7e893f940e4723d2af60',
      // 客户端密钥
      clientSecret: 'b5336eb0b13e2b09d26bc6f7fc84752c7c104db3',
      // Github 账号
      admin: [ 'Cat7373' ],
      // 创建 Issue 时，为 Issue 增加的标签
      labels: ['GitTalk'],
      // 如果 Issue 不存在，且登陆的是管理员账号，是否显示创建 Issue 按钮
      createIssueManually: true
    })
    // 初始化评论插件
    gitTalk.render('gitalk-page-container')
  }
}

onMounted(() => {
  init()
})
</script>
