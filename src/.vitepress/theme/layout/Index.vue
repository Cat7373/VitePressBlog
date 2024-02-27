<template>
  <Layout>
    <template #doc-after>
      <div id="gitalk-container"></div>
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import { useRoute } from 'vitepress'
import Theme from 'vitepress/theme'
import { watch, onMounted } from 'vue'
import Gitalk from 'gitalk'

const { Layout } = Theme
const route = useRoute()

const initGitalk = () => {
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
    labels: [ 'GitTalk' ],
    // 如果 Issue 不存在，且登陆的是管理员账号，是否显示创建 Issue 按钮
    createIssueManually: true,
    // 创建 Issue 时，用于唯一标识这篇文章的标记
    id: location.pathname,
  })
  // 初始化评论插件
  gitTalk.render('gitalk-container')
}

onMounted(initGitalk)
watch(
  () => route.path,
  initGitalk,
)
</script>
