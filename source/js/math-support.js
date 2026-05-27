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
    chtml: {
      scale: 0.9, 
      matchFontHeight: true, 
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    },
    startup: {
      pageReady: () => {
        return MathJax.startup.defaultPageReady().then(() => {
          console.log("MathJax initialised");

          // --- 新增：长数学公式横向滚动交互逻辑 ---
          
          // 获取所有块级公式的容器 (MathJax 3 默认使用 mjx-container 标签)
          const displayMathContainers = document.querySelectorAll('mjx-container[display="true"]');

          displayMathContainers.forEach(container => {
            // 1. 赋予基础 CSS 滚动属性
            container.style.overflowX = 'auto';
            container.style.overflowY = 'hidden';
            container.style.maxWidth = '100%';
            
            // 可选：为了更平滑的视觉体验，可以加上平滑滚动
            // container.style.scrollBehavior = 'smooth';

            // 2. 监听滚轮事件
            container.addEventListener('wheel', (e) => {
              // 判断：只有当容器内容实际溢出时（可滚动），才接管事件
              if (container.scrollWidth > container.clientWidth) {
                
                // 仅当用户使用的是普通鼠标滚轮（只有垂直滚动量 deltaY，没有横向滚动量 deltaX）时
                if (Math.abs(e.deltaY) > 0 && e.deltaX === 0) {
                  // 阻止页面整体向下滚动
                  e.preventDefault();
                  // 将滚轮的垂直滚动量映射到容器的横向滚动条上
                  container.scrollLeft += e.deltaY;
                }
              }
            }, { passive: false }); // 必须设置为 passive: false 才能使 e.preventDefault() 生效
          });
          
          // ----------------------------------------
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
