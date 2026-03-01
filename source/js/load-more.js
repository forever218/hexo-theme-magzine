// ===== Load More Articles (多语言适配 + 智能去重版) =====
function initLoadMore() {
  const loadMoreBtn = document.querySelector(".load-more-btn");
  if (!loadMoreBtn) return;

  // 1. 获取当前语言状态 (从 localStorage 读取)
  function isEnglish() {
    return localStorage.getItem("site_lang") === "en";
  }

  // 2. 定义多语言文本
  const texts = {
    loading: {
      zh: '<span class="loading"></span> 加载中...',
      en: '<span class="loading"></span> Loading...',
    },
    loadMore: {
      zh: "加载更多文章",
      en: "Load More Articles",
    },
    noMore: {
      zh: "没有了哦~",
      en: "No more articles~",
    },
    error: {
      zh: "加载文章失败",
      en: "Error loading articles",
    },
  };

  // 获取辅助函数：根据当前语言返回文本
  const getText = (key) => (isEnglish() ? texts[key].en : texts[key].zh);

  // 初始化按钮文字
  if (isEnglish()) {
    if (loadMoreBtn.innerText.trim() === "加载更多文章") {
      loadMoreBtn.innerText = texts.loadMore.en;
    }
  }

  loadMoreBtn.addEventListener("click", function () {
    const btn = this; // 缓存 this
    // 获取当前页码和总页数
    const currentPage = parseInt(btn.getAttribute("data-current-page")) || 1;
    const totalPages = parseInt(btn.getAttribute("data-total-pages")) || 1;
    const nextPage = currentPage + 1;

    // 如果已经是最后一页，隐藏按钮并返回
    if (currentPage >= totalPages) {
      btn.innerHTML = getText("noMore");
      btn.style.opacity = "0.6";
      btn.disabled = true;
      return;
    }

    // 显示加载状态
    btn.innerHTML = getText("loading");
    btn.disabled = true;

    // 构建下一页URL (适配 /page/2/ 结构)
    let currentPath = window.location.pathname;
    // 去掉尾部斜杠，去掉已有的 /page/xx
    currentPath = currentPath.replace(/\/$/, "").replace(/\/page\/\d+$/, "");
    // 如果是根路径空字符串，补全为 /
    if (currentPath === "") currentPath = "";
    
    const nextPageUrl = currentPath + "/page/" + nextPage + "/";

    // 获取下一页内容
    fetch(nextPageUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // 获取新页面的文章
        const newArticles = doc.querySelectorAll(".article-card");
        const articlesGrid = document.querySelector(".articles-grid");

        if (newArticles.length > 0 && articlesGrid) {
          // ★★★ 核心去重步骤 1：获取当前页面所有已存在的文章链接 ★★★
          const existingLinks = Array.from(articlesGrid.querySelectorAll(".article-title a"))
            .map(a => a.getAttribute("href"));

          let addedCount = 0;

          newArticles.forEach((article) => {
            // ★★★ 核心去重步骤 2：判断新文章是否已存在 ★★★
            const newLinkTag = article.querySelector(".article-title a");
            const newLink = newLinkTag ? newLinkTag.getAttribute("href") : null;

            // 如果链接不存在，才执行插入
            if (newLink && !existingLinks.includes(newLink)) {
              
              // 1. 处理英文模式下的静态文本翻译
              if (isEnglish()) {
                const readMore = article.querySelector(".read-more");
                if (readMore && readMore.innerText.includes("阅读更多")) {
                  readMore.innerText = "Read More →";
                }
                
                // 处理遮罩层文字 "点击阅读->" -> "Click to Read ->"
                const readOverlay = article.querySelector(".read-text");
                if (readOverlay && readOverlay.innerText.includes("点击阅读")) {
                  readOverlay.innerText = "Click to Read ->";
                }
              }

              // 2. 插入文章
              // 设置初始透明度为0，用于动画
              article.style.opacity = "0"; 
              article.classList.add("fade-in"); // 确保有 fade-in 类
              articlesGrid.appendChild(article);
              
              // 3. 简单的淡入动画
              setTimeout(() => {
                article.style.opacity = "1";
              }, 10 + (addedCount * 100)); // 依次延迟显示

              addedCount++;
            }
          });

          // 如果没有新文章被添加（都在这页了），说明可能到底了或者重复了
          if (addedCount === 0 && nextPage < totalPages) {
             console.warn("未添加新文章，可能是重复内容");
          }

          // ★★★ 更新按钮状态 ★★★
          if (nextPage >= totalPages) {
            btn.innerHTML = getText("noMore");
            btn.style.opacity = "0.6";
            btn.disabled = true;
          } else {
            btn.innerHTML = getText("loadMore");
            btn.disabled = false;
            // 重要：更新 data 属性，否则下次还会请求第2页
            btn.setAttribute("data-current-page", nextPage); 
          }
          
          // ★★★ 触发事件：让 article-modal.js 重新绑定点击事件 ★★★
          // article-modal.js 使用了 MutationObserver，会自动检测到 DOM 变化并绑定事件，无需额外操作
          
          // 如果有全局翻译插件，触发它
          if (window.i18n && typeof window.i18n.translateNode === 'function' && isEnglish()) {
             window.i18n.translateNode(articlesGrid);
          }

        } else {
          // 没找到文章容器
          btn.innerHTML = getText("noMore");
          btn.style.opacity = "0.6";
          btn.disabled = true;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        btn.innerHTML = getText("error");
        btn.style.opacity = "0.6";
        btn.disabled = false; // 允许重试
      });
  });
}

// 当DOM加载完成后初始化
document.addEventListener("DOMContentLoaded", initLoadMore);
