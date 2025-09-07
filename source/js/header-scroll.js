// Header Scroll Effect - Hide/Show on Scroll
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  let isScrollingUp = false;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    // 确定滚动方向
    if (currentScroll > lastScroll && currentScroll > 100) {
      // 向下滚动 - 隐藏导航栏
      if (!isScrollingUp) {
        header.classList.add('nav-up');
      }
      isScrollingUp = false;
    } else {
      // 向上滚动 - 显示导航栏
      if (isScrollingUp || currentScroll <= 100) {
        header.classList.remove('nav-up');
      }
      isScrollingUp = true;
    }

    // 根据滚动位置调整导航栏样式
    if (currentScroll > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  });
});