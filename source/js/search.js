// Newspaper Theme - Search Functionality

document.addEventListener('DOMContentLoaded', function() {
  initSearch();
});

function initSearch() {
  const searchToggle = document.querySelector('.search-toggle');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('.search-input');
  const searchResults = document.querySelector('.search-results');
  const searchClose = document.querySelector('.search-close');

  if (!searchToggle || !searchOverlay) return;

  // Toggle search overlay
  searchToggle.addEventListener('click', function() {
    searchOverlay.classList.add('active');
    searchInput.focus();
  });

  // Close search overlay
  searchClose.addEventListener('click', function() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
  });

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });

  // Close when clicking outside search container
  searchOverlay.addEventListener('click', function(e) {
    if (e.target === searchOverlay) {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });

  // Search functionality
  let searchIndex;

  // Load search index
  fetch('/search.json')
    .then(response => response.json())
    .then(data => {
      searchIndex = data;
    })
    .catch(error => {
      console.error('Error loading search index:', error);
    });

  // Handle search input
  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    if (!searchIndex) {
      searchResults.innerHTML = '<div class="search-no-results">搜索索引未加载</div>';
      return;
    }

    const results = [];

    // Search through posts
    searchIndex.forEach(post => {
      const titleMatch = post.title && post.title.toLowerCase().includes(query);
      const contentMatch = post.content && post.content.toLowerCase().includes(query);
      const tagsMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(query));

      if (titleMatch || contentMatch || tagsMatch) {
        results.push(post);
      }
    });

    // Display results
    displaySearchResults(results, query);
  });

  function displaySearchResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">没有找到相关结果</div>';
      return;
    }

    let html = `<div class="search-results-count">找到 ${results.length} 个结果</div>`;

    results.forEach(result => {
      // Highlight matching text
      let title = result.title || '无标题';
      let content = result.content || '';

      // Simple highlight for title
      if (title.toLowerCase().includes(query)) {
        const regex = new RegExp(`(${query})`, 'gi');
        title = title.replace(regex, '<mark>$1</mark>');
      }

      // Truncate and highlight content
      if (content.length > 150) {
        content = content.substring(0, 150) + '...';
      }

      if (content.toLowerCase().includes(query)) {
        const regex = new RegExp(`(${query})`, 'gi');
        content = content.replace(regex, '<mark>$1</mark>');
      }

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
