// Newspaper Theme - Dark Mode Sync Enhancement
// This script enhances dark mode synchronization between pages

document.addEventListener('DOMContentLoaded', function() {
  // Get the dark mode toggle button
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  if (!darkModeToggle) return;

  // Remove existing click event listener (if any)
  const newToggle = darkModeToggle.cloneNode(true);
  darkModeToggle.parentNode.replaceChild(newToggle, darkModeToggle);

  // 确保暗色模式类正确地应用到body元素
  function syncDarkModeClasses() {
    const htmlHasDarkMode = document.documentElement.classList.contains('dark-mode');
    const bodyHasDarkMode = document.body.classList.contains('dark-mode');

    // 如果html元素有暗色模式类但body元素没有，则同步到body元素
    if (htmlHasDarkMode && !bodyHasDarkMode) {
      document.body.classList.add('dark-mode');
    }
    // 如果body元素有暗色模式类但html元素没有，则同步到html元素
    else if (!htmlHasDarkMode && bodyHasDarkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }

  // 初始同步
  syncDarkModeClasses();

  // 设置按钮初始状态
  newToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';

  // Add enhanced click event listener
  newToggle.addEventListener('click', function() {
    const isDarkMode = !document.body.classList.contains('dark-mode');

    // 同时应用到html和body元素
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }

    this.innerHTML = isDarkMode ? '☀️' : '🌙';

    // Save preference
    localStorage.setItem('darkMode', isDarkMode);

    // Dispatch custom event to notify other components/pages of theme change
    const themeChangeEvent = new CustomEvent('themeChange', {
      detail: { isDarkMode: isDarkMode }
    });
    window.dispatchEvent(themeChangeEvent);
  });

  // Listen for theme change events from other pages/components
  window.addEventListener('themeChange', function(e) {
    const isDarkMode = e.detail.isDarkMode;
    const currentlyDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode !== currentlyDarkMode) {
      // 同时应用到html和body元素
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }

      newToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
      localStorage.setItem('darkMode', isDarkMode);
    }
  });

  // Listen for storage changes to sync theme across tabs
  window.addEventListener('storage', function(e) {
    if (e.key === 'darkMode') {
      const isDarkMode = e.newValue === 'true';
      const currentlyDarkMode = document.body.classList.contains('dark-mode');

      if (isDarkMode !== currentlyDarkMode) {
        // 同时应用到html和body元素
        if (isDarkMode) {
          document.documentElement.classList.add('dark-mode');
          document.body.classList.add('dark-mode');
        } else {
          document.documentElement.classList.remove('dark-mode');
          document.body.classList.remove('dark-mode');
        }

        newToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
      }
    }
  });

  // 监听页面显示事件，确保暗色模式类正确同步
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      syncDarkModeClasses();
    }
  });

  // 监听页面获得焦点事件，确保暗色模式类正确同步
  window.addEventListener('focus', function() {
    syncDarkModeClasses();
  });
});