// 文章模态窗口功能
document.addEventListener("DOMContentLoaded", function () {
  // 检查是否启用模态窗口模式，且屏幕宽度足够大
  const isSmallScreen = window.innerWidth <= 768;

  // ★★★ 恢复后的正式代码 ★★★
  // 只有当：
  // 1. window.theme 对象存在
  // 2. 且配置了 article_list
  // 3. 且 view_mode 设置为 'modal'
  // 4. 且不是手机小屏幕
  // 代码才会执行
  if (
    window.theme &&
    window.theme.article_list &&
    window.theme.article_list.view_mode === "modal" &&
    !isSmallScreen
  ) {
    // 创建模态窗口元素
    const modal = document.createElement("div");
    modal.className = "article-modal";
    modal.innerHTML = `
      <div class="article-modal-content">
        <div class="article-modal-header">
          <h2 class="article-modal-title">加载中...</h2>
          <button class="article-modal-close" aria-label="关闭">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="article-modal-body">
          <iframe class="article-modal-iframe" src="" title="文章内容"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const modalTitle = modal.querySelector(".article-modal-title");
    const modalClose = modal.querySelector(".article-modal-close");
    const modalIframe = modal.querySelector(".article-modal-iframe");

    // 辅助函数：更新模态框标题
    function updateModalTitleFromIframe() {
      try {
        // 尝试访问 iframe 内部文档
        const iframeDoc =
          modalIframe.contentDocument || modalIframe.contentWindow.document;

        // 1. 尝试获取文章标题 (h1.post-title 是常见的文章标题选择器，根据你的主题调整)
        let newTitle = "";
        const titleElement = iframeDoc.querySelector(
          "h1.post-title, h1.article-title, h1",
        );

        if (titleElement) {
          newTitle = titleElement.textContent.trim();
        } else {
          // 2. 如果没找到 h1，尝试获取 title 标签的内容
          newTitle = iframeDoc.title.split(" - ")[0]; // 通常 title 是 "文章名 - 站点名"，我们要去掉站点名
        }

        if (newTitle) {
          modalTitle.textContent = newTitle;
        }

        // 3. 注入 CSS 隐藏导航栏 (保持你原有的逻辑)
        const iframeStyle = iframeDoc.createElement("style");
        iframeStyle.id = "iframe-nav-style";
        // 隐藏 header, 隐藏 footer (可选), 调整顶部间距
        iframeStyle.innerHTML = `
          .header, header, .navbar { display: none !important; } 
          .footer, footer { display: none !important; }
          .post-wrapper, .article-container, main { margin-top: 0 !important; padding-top: 20px !important; }
          body { overflow-x: hidden; }
        `;
        iframeDoc.head.appendChild(iframeStyle);

        // 4. ★★★ 关键：监听 iframe 内部的链接点击 ★★★
        // 这样可以让 iframe 内部的跳转也能触发标题更新
        // 注意：这只对同源域名有效，跨域无法监听
      } catch (e) {
        // 跨域限制 (Cross-origin) 会导致无法访问 iframe 内容
        console.warn("无法访问iframe内容 (可能是跨域限制):", e);
      }
    }

    // 监听 iframe 加载完成事件
    // 每当 iframe 加载新页面（包括点击上一篇/下一篇）都会触发
    modalIframe.addEventListener("load", updateModalTitleFromIframe);

    // 为主页文章链接添加点击事件的函数
    function addClickEventToLinks() {
      const articleLinks = document.querySelectorAll(
        ".article-title a, .article-image a, .read-more",
      );

      articleLinks.forEach((link) => {
        // 跳过已经添加过事件的链接
        if (link.hasAttribute("data-modal-event")) return;
        link.setAttribute("data-modal-event", "true");

        link.addEventListener("click", function (e) {
          e.preventDefault();

          // 获取文章URL
          const articleUrl = this.getAttribute("href");

          // 设置初始标题 (作为加载时的占位符)
          // 1. 如果点击的是标题链接，直接取自己的文本
          let initialTitle = "加载中...";
          if (this.parentElement.classList.contains("article-title")) {
            initialTitle = this.textContent.trim();
          } else {
            // 2. 向上找到共同的卡片容器
            const card = this.closest(".article-card");
            if (card) {
              const titleElement = card.querySelector(".article-title");
              if (titleElement) {
                initialTitle = titleElement.textContent.trim();
              }
            }
          }
          if (!initialTitle || initialTitle === "加载中...") {
            initialTitle = this.getAttribute("title") || "文章详情";
          }

          modalTitle.textContent = initialTitle;

          // 设置iframe的src，这会触发上面的 load 事件
          modalIframe.src = articleUrl;

          // 显示模态窗口
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        });
      });
    }

    // 初始加载为链接添加事件
    addClickEventToLinks();

    // 创建MutationObserver来监听DOM变化 (适配 Load More)
    const observer = new MutationObserver(function (mutations) {
      let shouldUpdate = false;
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
          shouldUpdate = true;
        }
      });
      if (shouldUpdate) {
        addClickEventToLinks();
      }
    });

    // 开始观察 articles-grid 的变化，而不是 body，性能更好
    const grid = document.querySelector(".articles-grid");
    if (grid) {
      observer.observe(grid, { childList: true, subtree: true });
    } else {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // 关闭模态窗口
    function closeModal() {
      modal.classList.remove("active");
      // 延迟清空 src，避免关闭瞬间闪烁白屏
      setTimeout(() => {
        modalIframe.src = "";
      }, 300);
      document.body.style.overflow = ""; // 恢复背景滚动
      modalTitle.textContent = "";
    }

    // 点击关闭按钮
    modalClose.addEventListener("click", closeModal);

    // 点击模态窗口背景关闭
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // 按ESC键关闭模态窗口
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
    });
  }
});
