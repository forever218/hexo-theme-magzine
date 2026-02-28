// 文章模态窗口功能
document.addEventListener("DOMContentLoaded", function () {
  // 检查是否启用模态窗口模式，且屏幕宽度足够大
  const isSmallScreen = window.innerWidth <= 768;
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
          <h2 class="article-modal-title"></h2>
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

    // 为文章链接添加点击事件的函数
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

          // ★★★ 核心修复：智能获取文章标题 ★★★
          let articleTitle = "";

          // 1. 如果点击的是标题链接，直接取自己的文本
          if (this.parentElement.classList.contains("article-title")) {
            articleTitle = this.textContent.trim();
          }
          // 2. 如果点击的是图片或阅读更多按钮，去寻找同级卡片里的标题
          else {
            // 向上找到共同的卡片容器
            const card = this.closest(".article-card");
            if (card) {
              const titleElement = card.querySelector(".article-title");
              if (titleElement) {
                articleTitle = titleElement.textContent.trim();
              }
            }
          }

          // 如果实在没找到，才使用默认文本（防止变成"点击阅读->"）
          if (!articleTitle) {
            articleTitle = this.getAttribute("title") || "文章详情";
          }

          // 设置模态窗口标题
          modalTitle.textContent = articleTitle;

          // 设置iframe的src
          modalIframe.src = articleUrl;

          // 显示模态窗口
          modal.classList.add("active");

          // 禁止背景滚动
          document.body.style.overflow = "hidden";

          // 添加CSS规则隐藏文章页顶部导航栏
          const style = document.createElement("style");
          style.id = "modal-nav-style";
          style.innerHTML =
            ".article-modal-iframe::-webkit-scrollbar { display: none; }";
          document.head.appendChild(style);

          // 当iframe加载完成后，向iframe注入CSS隐藏导航栏并上移文章内容
          modalIframe.onload = function () {
            try {
              const iframeDoc =
                modalIframe.contentDocument ||
                modalIframe.contentWindow.document;
              const iframeStyle = iframeDoc.createElement("style");
              iframeStyle.id = "iframe-nav-style";
              // 这里确保隐藏导航栏，并且微调顶部间距
              iframeStyle.innerHTML =
                ".header { display: none !important; height: 0; margin: 0; padding: 0; } .post-wrapper { margin-top: -60px; }";
              iframeDoc.head.appendChild(iframeStyle);
            } catch (e) {
              console.error("无法访问iframe内容:", e);
            }
          };
        });
      });
    }

    // 初始加载��为链接添加事件
    addClickEventToLinks();

    // 创建MutationObserver来监听DOM变化
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
          addClickEventToLinks();
        }
      });
    });

    // 开始观察document.body的变化
    observer.observe(document.body, { childList: true, subtree: true });

    // 关闭模态窗口
    function closeModal() {
      modal.classList.remove("active");
      modalIframe.src = ""; // 清空iframe内容，停止加载
      document.body.style.overflow = ""; // 恢复背景滚动

      // 移除注入的样式
      const modalStyle = document.getElementById("modal-nav-style");
      if (modalStyle) {
        modalStyle.remove();
      }
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
