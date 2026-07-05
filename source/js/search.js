// Newspaper Theme - Search Functionality

document.addEventListener("DOMContentLoaded", function () {
  initSearch();
});

function initSearch() {
  const searchToggle = document.querySelector(".search-toggle");
  const searchOverlay = document.querySelector(".search-overlay");
  const searchInput = document.querySelector(".search-input");
  const searchResults = document.querySelector(".search-results");
  const searchClose = document.querySelector(".search-close");

  if (!searchToggle || !searchOverlay) return;

  // 1. 辅助翻译函数
  function t(text) {
    if (window.i18n && typeof window.i18n.get === "function") {
      return window.i18n.get(text);
    }
    return text;
  }

  // Toggle search overlay
  searchToggle.addEventListener("click", function () {
    searchOverlay.classList.add("active");
    searchInput.focus(); // Focus on input when opened
  });

  // Close search overlay
  searchClose.addEventListener("click", function () {
    searchOverlay.classList.remove("active");
    searchInput.value = "";
    searchResults.innerHTML = "";
  });

  // Close on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
      searchOverlay.classList.remove("active");
      searchInput.value = "";
      searchResults.innerHTML = "";
    }
  });

  // Close when clicking outside search container
  searchOverlay.addEventListener("click", function (e) {
    if (e.target === searchOverlay) {
      searchOverlay.classList.remove("active");
      searchInput.value = "";
      searchResults.innerHTML = "";
    }
  });

  // Search functionality
  let searchIndex;

  // Load search index
  fetch("/search.json")
    .then((response) => response.json())
    .then((data) => {
      searchIndex = data;
    })
    .catch((error) => {
      console.error("Error loading search index:", error);
    });

  // Handle search input
  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    // Clear results if query is too short
    if (query.length < 2) {
      searchResults.innerHTML = "";
      return;
    }

    if (!searchIndex) {
      // ★★★ 修改点 1：翻译错误提示 ★★★
      searchResults.innerHTML = `<div class="search-no-results">${t("搜索索引未加载")}</div>`;
      return;
    }

    const results = [];

    // Search through posts
    searchIndex.forEach((post) => {
      // Check if title, content or tags match query
      const titleMatch = post.title && post.title.toLowerCase().includes(query);
      const contentMatch =
        post.content && post.content.toLowerCase().includes(query);
      // Check if tags exist before filtering
      const tagsMatch =
        post.tags &&
        Array.isArray(post.tags) &&
        post.tags.some((tag) => tag.toLowerCase().includes(query));

      if (titleMatch || contentMatch || tagsMatch) {
        results.push(post);
      }
    });

    // Display results
    displaySearchResults(results, query);
  });

  function displaySearchResults(results, query) {
    if (results.length === 0) {
      // ★★★ 修改点 2：翻译无结果提示 ★★★
      searchResults.innerHTML = `<div class="search-no-results">${t("没有找到相关结果")}</div>`;
      return;
    }

    // ★★★ 修改点 3：处理带有变量的翻译 ★★★
    // 逻辑：如果是英文模式，拼接英文格式；否则用中文格式
    let countHtml = "";
    if (window.i18n && window.i18n.isEn()) {
      countHtml = `Found ${results.length} results`;
    } else {
      countHtml = `找到 ${results.length} 个结果`;
    }

    let html = `<div class="search-results-count">${countHtml}</div>`;

    results.forEach((result) => {
      // Highlight matching text
      let title = result.title || "无标题";
      let content = result.content || "";

      // Simple highlight for title
      if (title.toLowerCase().includes(query)) {
        const regex = new RegExp(`(${query})`, "gi");
        title = title.replace(regex, "<mark>$1</mark>");
      }

      // Truncate and highlight content
      if (content.length > 150) {
        content = content.substring(0, 150) + "...";
      }

      if (content.toLowerCase().includes(query)) {
        const regex = new RegExp(`(${query})`, "gi");
        content = content.replace(regex, "<mark>$1</mark>");
      }

      // Add result item to HTML
      html += `
        <div class="search-result-item">
          <a href="${result.url}" class="search-result-link">
            <h3 class="search-result-title">${title}</h3>
            <p class="search-result-content">${content}</p>
          </a>
        </div>
      `;
    });

    searchResults.innerHTML = html;
  }
}
