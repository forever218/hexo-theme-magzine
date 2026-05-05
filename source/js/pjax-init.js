document.addEventListener("DOMContentLoaded", function () {
  if (typeof Pjax === "undefined") return;

  const pjax = new Pjax({
    // 拦截普通链接
    elements:
      "a:not([target='_blank']):not([href^='#']):not([data-pjax-state=''])",
    selectors: [
      "title", // 更新标题
      "main.main", // 只替换主内容区
      ".nav-menu", // 更新导航栏状态
    ],
    cacheBust: false,
    timeout: 5000,
  });

  // 1. 页面开始请求：可以加个透明度过渡动画
  document.addEventListener("pjax:send", function () {
    const main = document.querySelector("main.main");
    if (main) {
      main.style.transition = "opacity 0.3s ease";
      main.style.opacity = "0.4";
    }
  });

  // 2. ★★★ 黑魔法：页面替换完成后的全局唤醒 ★★★
  document.addEventListener("pjax:complete", function () {
    const main = document.querySelector("main.main");
    if (main) main.style.opacity = "1";

    // 魔法 1：重新触发所有的 DOMContentLoaded 事件
    // 绝大多数的普通脚本（比如你的 tags.js、部分主题自带 JS）只要收到这个事件就会重新干活
    window.dispatchEvent(new Event("DOMContentLoaded"));

    // 魔法 2：触发 load 事件，部分依赖页面完全加载的脚本需要这个
    window.dispatchEvent(new Event("load"));

    // 魔法 3：重新执行 AI 脚本或特定的外部依赖
    // 如果你有 MathJax (数学公式)
    if (typeof MathJax !== "undefined" && MathJax.typesetPromise) {
      MathJax.typesetPromise();
    }

    // 如果你有 Twikoo 评论，强制它在新的容器里重新加载
    if (typeof twikoo !== "undefined") {
      try {
        twikoo.init({
          envId: window.theme.comments.twikoo.envId, // 你的envId
          el: "#twikoo", // 评论容器
        });
      } catch (e) {}
    }

    // 如果你引用的 AI 摘要脚本暴露了重载方法，直接调用（大部分会自动响应 DOMContentLoaded）
  });
});
