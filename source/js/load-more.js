// ===== Load More Articles =====
function initLoadMore() {
  const loadMoreBtn = document.querySelector('.load-more-btn');
  if (!loadMoreBtn) return;

  // 获取当前页码和总页数
  const currentPage = parseInt(loadMoreBtn.getAttribute('data-current-page')) || 1;
  const totalPages = parseInt(loadMoreBtn.getAttribute('data-total-pages')) || 1;

  // 如果已经是最后一页，隐藏按钮
  if (currentPage >= totalPages) {
    loadMoreBtn.style.display = 'none';
    return;
  }

  loadMoreBtn.addEventListener('click', function() {
    // 获取当前页码（从按钮属性中获取，而不是使用初始化时的值）
    const currentPage = parseInt(this.getAttribute('data-current-page')) || 1;
    const nextPage = currentPage + 1;

    // 显示加载状态
    this.innerHTML = '<span class="loading"></span> Loading...';
    this.disabled = true;

    // 构建下一页URL
    let currentPath = window.location.pathname;

    // 移除末尾的斜杠，避免重复
    if (currentPath.endsWith('/')) {
      currentPath = currentPath.slice(0, -1);
    }

    // 如果当前路径已经包含/page/x，移除它
    currentPath = currentPath.replace(/\/page\/\d+$/, '');

    // 构建下一页URL
    const nextPageUrl = currentPath + '/page/' + nextPage + '/';

    // 获取下一页内容
    fetch(nextPageUrl)
      .then(response => response.text())
      .then(html => {
        // 创建临时DOM元素来解析HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 获取新文章
        const newArticles = doc.querySelectorAll('.article-card');
        const articlesGrid = document.querySelector('.articles-grid');

        if (newArticles.length > 0 && articlesGrid) {
          // 获取当前文章数量，用于确定尺寸类
          const currentArticles = articlesGrid.querySelectorAll('.article-card');
          const startIndex = currentArticles.length;

          // 获取当前文章的链接，用于检查重复
          const currentArticleLinks = Array.from(currentArticles).map(article => {
            const link = article.querySelector('a[href]');
            return link ? link.getAttribute('href') : '';
          });

          // 获取当前屏幕宽度，确定列数
          let columns = 4; // 默认4列
          if (window.innerWidth <= 480) columns = 1;
          else if (window.innerWidth <= 768) columns = 2;
          else if (window.innerWidth <= 1200) columns = 3;

          // 创建一个文档片段，减少DOM操作
          const fragment = document.createDocumentFragment();

          // 添加新文章到网格
          newArticles.forEach((article, index) => {
            // 获取新文章的链接
            const newArticleLink = article.querySelector('a[href]');
            const newLink = newArticleLink ? newArticleLink.getAttribute('href') : '';

            // 检查文章是否已经存在
            if (currentArticleLinks.includes(newLink)) {
              return; // 如果文章已存在，跳过此文章
            }

            // 克隆文章元素
            const clonedArticle = article.cloneNode(true);

            // 移除原有的尺寸类
            clonedArticle.className = clonedArticle.className.replace(/article-card--(large|medium|small|wide|tall)/g, '');

            // 根据位置和列数确定尺寸类
            const positionInRow = (startIndex + index) % columns;
            let sizeClass;

            // 根据列数和位置确定尺寸类
            if (columns === 1) {
              // 单列布局，全部使用medium
              sizeClass = 'article-card--medium';
            } else if (columns === 2) {
              // 双列布局
              if (positionInRow === 0) {
                sizeClass = Math.random() > 0.5 ? 'article-card--large' : 'article-card--tall';
              } else {
                sizeClass = 'article-card--medium';
              }
            } else if (columns === 3) {
              // 三列布局
              if (positionInRow === 0) {
                sizeClass = Math.random() > 0.5 ? 'article-card--wide' : 'article-card--large';
              } else {
                sizeClass = 'article-card--medium';
              }
            } else {
              // 四列布局
              if (positionInRow === 0) {
                sizeClass = 'article-card--large';
              } else if (positionInRow === 1) {
                sizeClass = Math.random() > 0.5 ? 'article-card--tall' : 'article-card--wide';
              } else {
                sizeClass = 'article-card--medium';
              }
            }

            clonedArticle.classList.add(sizeClass);

            // 设置初始透明度用于淡入效果
            clonedArticle.style.opacity = '0';
            clonedArticle.style.transition = 'opacity 0.5s ease';

            // 添加到文档片段
            fragment.appendChild(clonedArticle);
          });

          // 一次性添加所有新文章到网格
          articlesGrid.appendChild(fragment);

          // 触发淡入效果
          setTimeout(() => {
            const newCards = articlesGrid.querySelectorAll('.article-card');
            for (let i = startIndex; i < newCards.length; i++) {
              newCards[i].style.opacity = '1';
            }
          }, 10);

          // 更新按钮状态
          if (nextPage >= totalPages) {
            this.innerHTML = 'No more articles';
            this.style.opacity = '0.6';
            this.disabled = true; // 禁用按钮，防止重复点击
          } else {
            this.innerHTML = 'Load More Articles';
            this.disabled = false;
            this.setAttribute('data-current-page', nextPage);
          }
        } else {
          this.innerHTML = 'No more articles';
          this.style.opacity = '0.6';
          this.disabled = true; // 禁用按钮，防止重复点击
        }
      })
      .catch(error => {
        console.error('Error loading more articles:', error);
        this.innerHTML = 'Error loading articles';
        this.style.opacity = '0.6';
        this.disabled = true; // 禁用按钮，防止重复点击
      });
  });
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initLoadMore);





