
/**
 * 加载动画控制
 */
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否启用了加载动画
  if (window.theme && window.theme.features && window.theme.features.loading_animation) {
    // 创建加载动画元素
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';

    // 将加载动画添加到body
    document.body.appendChild(loadingOverlay);

    // 页面完全加载后隐藏加载动画
    window.addEventListener('load', function() {
      setTimeout(function() {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.visibility = 'hidden';

        // 动画结束后从DOM中移除
        setTimeout(function() {
          if (document.body.contains(loadingOverlay)) {
            document.body.removeChild(loadingOverlay);
          }
        }, 500); // 等待淡出动画完成
      }, 300); // 短暂延迟以确保内容已渲染
    });
  }
});
