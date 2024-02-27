# Cloudflare 部署 VitePress 不显示文章

近期想写博客了，主要 [调试 pm2](01-pm2-treekill) 这经历太 shit，之前的博客有年头没写了，项目搭出来快 10 年了，一看挺头疼，网上找了找，决定用 VitePress 重新搭一个，用 Cloudflare Pages 免费构建和当服务器；

部署后，进文章有时正常显示，有时文章内容一闪就没，有时候干脆不出内容，同时控制台有个 `Hydration completed but contains mismatches` 的报错；

搜了下，似乎是 Cloudflare 自动优化 html 导致的问题（[相关 Issue](https://github.com/vuejs/vitepress/issues/369)），关掉它之后就正常了；



![](/uploads/iShot_2024-02-27_15.11.32.png)

