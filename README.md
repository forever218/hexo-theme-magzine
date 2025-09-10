# Magzine主题

一款现代化的杂志风格 Hexo 主题，大屏支持，简洁、优雅、快速。


## 功能特性

-   **现代化设计**：简洁、极简的美学设计，流畅的交互体验   
-   **杂志式布局**：动态文章卡片，支持多种大小和位置     
-   **响应式设计**：适配设备，大屏支持  
-   **高度可定制**：丰富的主题配置选项  
-   **性能优化**：平滑滚动、动画优化  
-   **AI摘要**：接入deepseek摘要功能  
-   **标签外挂**： 移植了[anzhiyu](https://blog.anheyu.com/posts/d50a.html)和[butterfly](https://butterfly.js.org/posts/2df239ce/)主题的大部分标签外挂   

------------------------------------------------------------------------

## 安装方法

1.  将主题克隆或下载到 Hexo 项目的 `themes` 目录：

``` bash
git clone https://github.com/forever218/hexo-theme-magzine.git themes/magzine
```

2.  修改 Hexo 站点的 `_config.yml` 文件，设置主题为 Magzine：

``` yaml
theme: magzine
```

3.  安装依赖：

``` bash
npm install
```

⚠️请确保hexo根目录的`package.json`包含以下依赖：
``` json
    "hexo": "^7.0.0",
    "hexo-generator-archive": "^2.0.0",
    "hexo-generator-category": "^2.0.0",
    "hexo-generator-index": "^3.0.0",
    "hexo-generator-search": "^2.4.3",
    "hexo-generator-tag": "^2.0.0",
    "hexo-renderer-ejs": "^2.0.0",
    "hexo-renderer-marked": "^6.0.0",
    "hexo-renderer-pug": "^3.0.0",
    "hexo-renderer-stylus": "^3.0.0",
    "hexo-server": "^3.0.0",
    "hexo-theme-landscape": "^1.0.0",
    "hexo-util": "^3.3.0"
```

------------------------------------------------------------------------

## 贡献指南

1.  Fork 本仓库  
2.  创建功能分支   
3.  编写代码并提交   
4.  如果需要，添加测试   
5.  提交 Pull Request

------------------------------------------------------------------------

## 开源协议
本主题使用 **Apache License Version 2.0** 协议开源，您可以在遵守协议的前提下自由使用、修改和分发本主题。

------------------------------------------------------------------------

## 支持与反馈

如果遇到问题或有疑问：

1.  查看 [文档](docs/)\
2.  搜索已有
    [Issues](https://github.com/yourusername/hexo-theme-magzine/issues)\
3.  必要时提交新 Issue

------------------------------------------------------------------------

## 致谢

-   [Hexo](https://hexo.io/) --- 静态博客框架\
-   [Pug](https://pugjs.org/) --- 模板引擎\
-   [Font Awesome](https://fontawesome.com/) --- 图标（可选）



