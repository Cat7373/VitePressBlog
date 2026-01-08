# Cloudflare 部署 VitePress 最后修改时间不正确

新博客基于 VitePress + Cloudflare Pages 搭建后，发现所有文章的最后更新时间都是一样的；

解决方案很简单（[参考 Issue](https://github.com/vuejs/vitepress/discussions/3580)），`package.json` 里添加一个专用于 Cloudflare 的构建命令即可：

```js
{
  "scripts": {
    "cfbuild": "git fetch --unshallow && vitepress build src"
  }
}
```
