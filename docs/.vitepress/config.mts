import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cat73 Blog",
  description: "喵星人占领地球战略指挥部",
  lang: 'zh-CN',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: '2024',
        items: [
          { text: 'PM2 环境下自动更新的坑', link: '/posts/2024/01-pm2-treekill' },
          { text: '2024-Demo01', link: '/posts/2024/02-demo02' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Cat7373/VitePressBlog' }
    ]
  }
})
