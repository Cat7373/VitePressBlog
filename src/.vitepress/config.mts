import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cat73 Blog",
  description: "喵星人占领地球战略指挥部",
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  sitemap: {
    hostname: 'https://blog.cat73.org'
  },
  themeConfig: {
    logo: { src: '/uploads/headimg.jpg', width: 24, height: 24 },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/posts/about' },
    ],

    sidebar: [
      {
        text: '2024',
        collapsed: false,
        items: [
          { text: 'Navicat 15/16 在 MacOS 无限试用', link: '/posts/2024/03-navicat-trial' },
          { text: 'Cloudflare 部署 VitePress 不显示文章', link: '/posts/2024/02-cloudflare-vitepress' },
          { text: 'PM2 环境下自动更新的坑', link: '/posts/2024/01-pm2-treekill' },
        ]
      },
    ],

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Cat7373' },
      { icon: 'npm', link: 'https://www.npmjs.com/~cat73' },
    ],

    footer: {
      copyright: `版权所有 © 2024-${new Date().getFullYear()} Cat73`
    },

    editLink: {
      pattern: 'https://github.com/Cat7373/VitePressBlog/tree/main/src/:path'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  }
})
