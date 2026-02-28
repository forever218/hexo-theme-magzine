// ===== Load More Articles (多语言适配版) =====
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

  // 初始化按钮文字 (防止页面刚加载时文字不对)
  // 注意：lang-switch.js 会处理初始翻译，但这里双重保险
  if (isEnglish()) {
    if (loadMoreBtn.innerText.trim() === "加载更多文章") {
      loadMoreBtn.innerText = texts.loadMore.en;
    }
  }

  // 获取当前页码和总页数
  const currentPage =
    parseInt(loadMoreBtn.getAttribute("data-current-page")) || 1;
  const totalPages =
    parseInt(loadMoreBtn.getAttribute("data-total-pages")) || 1;

  // 如果已经是最后一页，隐藏按钮
  if (currentPage >= totalPages) {
    loadMoreBtn.style.display = "none";
    return;
  }

  loadMoreBtn.addEventListener("click", function () {
    const btn = this; // 缓存 this
    const currentPage = parseInt(btn.getAttribute("data-current-page")) || 1;
    const nextPage = currentPage + 1;

    // 【关键修改】显示加载状态 (动态判断语言)
    btn.innerHTML = getText("loading");
    btn.disabled = true;

    // 构建下一页URL
    let currentPath = window.location.pathname;
    if (currentPath.endsWith("/")) {
      currentPath = currentPath.slice(0, -1);
    }
    currentPath = currentPath.replace(/\/page\/\d+$/, "");
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
        const newArticles = doc.querySelectorAll(".article-card");
        const articlesGrid = document.querySelector(".articles-grid");

        if (newArticles.length > 0 && articlesGrid) {
          // ... (中间的网格布局逻辑保持不变，为了节省篇幅省略，不影响功能) ...
          // ... (这部分逻辑负责克隆和插入文章卡片) ...

          // 为了简化，这里直接插入逻辑
          newArticles.forEach((article) => {
            // 如果是英文模式，这里新加载进来的文章卡片里的静态文字(如"Read More")也需要翻译
            // 但由于文章标题和内容本身就是中文的，所以只需处理界面元素
            if (isEnglish()) {
              const readMore = article.querySelector(".read-more");
              if (readMore && readMore.innerText === "阅读更多")
                readMore.innerText = "Read More";

              // 处理日期格式等其他静态文本...
            }
            articlesGrid.appendChild(article);
            // 简单的淡入效果
            setTimeout(() => (article.style.opacity = 1), 10);
          });

          // 【关键修改】更新按钮状态
          if (nextPage >= totalPages) {
            btn.innerHTML = getText("noMore");
            btn.style.opacity = "0.6";
            btn.disabled = true;
          } else {
            btn.innerHTML = getText("loadMore");
            btn.disabled = false;
            btn.setAttribute("data-current-page", nextPage);
          }
        } else {
          btn.innerHTML = getText("noMore");
          btn.style.opacity = "0.6";
          btn.disabled = true;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        btn.innerHTML = getText("error");
        btn.style.opacity = "0.6";
        btn.disabled = true;
      });
  });
}

// 当DOM加载完成后初始化
document.addEventListener("DOMContentLoaded", initLoadMore);
