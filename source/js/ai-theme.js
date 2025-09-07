/*
 * AI摘要主题切换脚本
 * 处理AI摘要区域的明暗模式切换效果
 */

(function() {
  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    // 获取AI摘要元素
    const aiSummary = document.getElementById('post-ai');
    if (!aiSummary) return;

    // 检测当前主题状态
    function getCurrentTheme() {
      return document.documentElement.classList.contains('dark-mode') || 
             document.body.classList.contains('dark-mode') ||
             document.documentElement.classList.contains('dark-theme') ||
             document.body.classList.contains('dark') ||
             document.body.classList.contains('dark-theme') ||
             document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // 应用主题到AI摘要
    function applyThemeToAISummary(isDark) {
      if (isDark) {
        aiSummary.classList.add('dark-theme');
      } else {
        aiSummary.classList.remove('dark-theme');
      }
    }

    // 初始应用主题
    applyThemeToAISummary(getCurrentTheme());

    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          applyThemeToAISummary(getCurrentTheme());
        }
      });
    });

    // 观察HTML元素和body元素的类变化
    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });

    // 监听data-theme属性变化
    const themeObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          applyThemeToAISummary(getCurrentTheme());
        }
      });
    });

    themeObserver.observe(document.documentElement, { attributes: true });

    // 监听localStorage变化（用于跨标签页主题同步）
    window.addEventListener('storage', function(e) {
      if (e.key === 'darkMode' || e.key === 'theme') {
        applyThemeToAISummary(getCurrentTheme());
      }
    });

    // 添加主题切换动画效果
    function addThemeTransition() {
      document.body.classList.add('theme-transition');
      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 600);
    }

    // 监听主题切换按钮点击事件
    const themeToggleButtons = document.querySelectorAll('.theme-toggle, .dark-mode-toggle, [id*="theme"], [class*="theme"]');
    themeToggleButtons.forEach(button => {
      button.addEventListener('click', addThemeTransition);
    });

    // 为AI摘要添加动态主题色效果
    function updateAccentColor() {
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color').trim() || '#ff6b6b';

      document.documentElement.style.setProperty('--ai-accent-color', accentColor);
    }

    // 初始化主题色
    updateAccentColor();

    // 监听主题色变化
    const colorObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          updateAccentColor();
        }
      });
    });

    colorObserver.observe(document.documentElement, { attributes: true });

    // 为AI摘要添加交互效果
    const aiTitle = aiSummary.querySelector('.ai-title');
    const aiExplanation = aiSummary.querySelector('.ai-explanation');
    const aiButtons = aiSummary.querySelectorAll('.ai-btn-item');

    // 标题悬停效果
    if (aiTitle) {
      aiTitle.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });

      aiTitle.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    }

    // 内容区域悬停效果
    if (aiExplanation) {
      aiExplanation.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      });

      aiExplanation.addEventListener('mouseleave', function() {
        this.style.boxShadow = 'none';
      });
    }

    // 按钮点击效果
    aiButtons.forEach(button => {
      button.addEventListener('click', function() {
        // 添加涟漪效果
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);

        // 计算涟漪位置
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // 移除涟漪
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // 添加涟漪效果样式
    const style = document.createElement('style');
    style.textContent = `
      .ai-btn-item {
        position: relative;
        overflow: hidden;
      }

      .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
      }

      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  });
})();
