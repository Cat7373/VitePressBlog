import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Cat73 Blog",
  description: "喵星人占领地球战略指挥部",
  lang: 'zh-Hans',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  sitemap: {
    hostname: 'https://blog.cat73.org'
  },
  themeConfig: {
    logo: { src: '/uploads/headimg.jpg' },

    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/posts/about' },
    ],

    sidebar: [
      {
        text: '2024',
        collapsed: false,
        items: [
          { text: 'Puppeteer 随笔', link: '/posts/2024/06-puppeteer' },
          { text: 'Cloudflare 部署 VitePress 最后修改时间不正确', link: '/posts/2024/05-cloudflare-vitepress-lastupdate' },
          { text: '通过 Gitalk 为 VitePress 增加评论功能', link: '/posts/2024/04-vitepress-gitalk' },
          { text: 'Navicat 15/16 在 MacOS 无限试用', link: '/posts/2024/03-navicat-trial' },
          { text: 'Cloudflare 部署 VitePress 不显示文章', link: '/posts/2024/02-cloudflare-vitepress' },
          { text: 'PM2 环境下自动更新的坑', link: '/posts/2024/01-pm2-treekill' },
        ]
      },
    ],

    search: {
      provider: 'local',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Cat7373' },
      { icon: 'npm', link: 'https://www.npmjs.com/~cat73' },
    ],

    footer: {
      copyright: `版权所有 © 2024-${new Date().getFullYear()} Cat73 &nbsp; &nbsp; Powered by VitePress`,
    },

    editLink: {
      text: '查看源代码',
      pattern: 'https://github.com/Cat7373/VitePressBlog/tree/main/src/:path',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  }
})
