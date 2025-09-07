// 分类页面展开/折叠功能
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否为展开式布局
  const isAccordionLayout = document.querySelector('.categories-accordion');
  if (!isAccordionLayout) return; // 如果不是展开式布局，不执行以下代码

  // 获取主题配置
  const accordionAnimation = window.theme && window.theme.categories && window.theme.categories.accordion_animation !== false;

  // 获取所有分类头部
  const categoryHeaders = document.querySelectorAll('.category-header');

  // 为每个分类头部添加点击事件
  categoryHeaders.forEach(header => {
    header.addEventListener('click', function(e) {
      // 阻止事件冒泡，防止触发其他事件
      e.preventDefault();
      e.stopPropagation();

      // 获取父级分类区块
      const categorySection = this.closest('.category-section');
      const isActive = categorySection.classList.contains('active');

      // 获取文章列表区域
      const categoryPosts = categorySection.querySelector('.category-posts');
      const noPosts = categorySection.querySelector('.no-posts');

      // 如果当前分类已经是展开状态，则折叠它
      if (isActive) {
        categorySection.classList.remove('active');

        if (categoryPosts) {
          categoryPosts.style.display = 'none';
        }

        if (noPosts) {
          noPosts.style.display = 'none';
        }
      } else {
        // 如果当前分类是折叠状态，则展开它并折叠其他分类

        // 先折叠所有其他分类
        document.querySelectorAll('.category-section').forEach(section => {
          if (section !== categorySection) { // 不处理当前点击的分类
            section.classList.remove('active');

            const posts = section.querySelector('.category-posts');
            const empty = section.querySelector('.no-posts');

            if (posts) {
              posts.style.display = 'none';
            }

            if (empty) {
              empty.style.display = 'none';
            }
          }
        });

        // 展开当前分类
        categorySection.classList.add('active');

        if (categoryPosts) {
          categoryPosts.style.display = 'block';
          if (accordionAnimation) {
            // 添加淡入效果
            categoryPosts.style.opacity = '0';
            setTimeout(() => {
              categoryPosts.style.opacity = '1';
            }, 10);
          }
        }

        if (noPosts) {
          noPosts.style.display = 'block';
          if (accordionAnimation) {
            // 添加淡入效果
            noPosts.style.opacity = '0';
            setTimeout(() => {
              noPosts.style.opacity = '1';
            }, 10);
          }
        }

        // 添加平滑滚动效果
        setTimeout(() => {
          categorySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }

      // 阻止默认行为，防止链接跳转
      return false;
    }, true); // 使用捕获阶段
  });

  // 如果URL中包含分类参数，自动展开对应分类
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  if (categoryParam) {
    const targetCategory = document.querySelector(`.category-section[data-category="${categoryParam}"]`);
    if (targetCategory) {
      const header = targetCategory.querySelector('.category-header');
      if (header) {
        // 延迟执行，确保页面完全加载
        setTimeout(() => {
          // 创建自定义事件并触发
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          header.dispatchEvent(clickEvent);
        }, 500);
      }
    }
  }
});
