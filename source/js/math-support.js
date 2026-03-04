// MathJax 配置与加载脚本
(function () {
  // 1. 配置 MathJax
  window.MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ], // 行内公式格式
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ], // 块级公式格式
      processEscapes: true,
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"], // 忽略这些标签内的公式
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
