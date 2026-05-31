// 分类页面展开/折叠功能
document.addEventListener('DOMContentLoaded', function() {
  var accordion = document.querySelector('.categories-accordion');
  if (!accordion) return;

  var useAnimation = window.theme && window.theme.categories && window.theme.categories.accordion_animation !== false;

  // 切换元素可见性
  function toggleEl(el, show) {
    if (!el) return;
    if (show) {
      el.style.display = 'block';
      if (useAnimation) {
        el.style.opacity = '0';
        requestAnimationFrame(function() { el.style.opacity = '1'; });
      }
    } else {
      if (useAnimation) {
        el.style.opacity = '0';
        setTimeout(function() { el.style.display = 'none'; }, 250);
      } else {
        el.style.display = 'none';
      }
    }
  }

  // 折叠所有分类
  function collapseAll(except) {
    document.querySelectorAll('.category-section').forEach(function(section) {
      if (section === except) return;
      section.classList.remove('active');
      toggleEl(section.querySelector('.category-posts'), false);
      toggleEl(section.querySelector('.no-posts'), false);
    });
  }

  // 点击事件处理
  accordion.addEventListener('click', function(e) {
    var header = e.target.closest('.category-header');
    if (!header) return;

    e.preventDefault();
    e.stopPropagation();

    var section = header.closest('.category-section');
    var isActive = section.classList.contains('active');
    var posts = section.querySelector('.category-posts');
    var noPosts = section.querySelector('.no-posts');

    if (isActive) {
      section.classList.remove('active');
      toggleEl(posts, false);
      toggleEl(noPosts, false);
    } else {
      collapseAll(section);
      section.classList.add('active');
      toggleEl(posts, true);
      toggleEl(noPosts, true);
      setTimeout(function() {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }

    return false;
  }, true);

  // URL 参数自动展开
  var categoryParam = new URLSearchParams(window.location.search).get('category');
  if (categoryParam) {
    var target = document.querySelector('.category-section[data-category="' + categoryParam + '"]');
    if (target) {
      setTimeout(function() {
        target.querySelector('.category-header').click();
      }, 500);
    }
  }
});
