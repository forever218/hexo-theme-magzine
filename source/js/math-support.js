// MathJax 配置与加载脚本
(function () {
  // 1. 配置 MathJax
  window.MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
    },
    // 新增 chtml 配置，控制缩放比例
    chtml: {
      scale: 0.9, // 将全局公式渲染大小缩小到 90% (你可以根据视觉效果在 0.85 - 1.0 之间调整)
      matchFontHeight: true, // 匹配周围文字的 x-height
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    },
    startup: {
      pageReady: () => {
        return MathJax.startup.defaultPageReady().then(() => {
          console.log("MathJax initialised");
        });
      },
    },
  };

  // 2. 动态加载 MathJax 脚本
  let script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
  script.async = true;
  script.id = "MathJax-script";
  document.head.appendChild(script);
})();
