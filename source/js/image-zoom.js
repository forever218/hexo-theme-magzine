
// 图片点击放大功能
document.addEventListener('DOMContentLoaded', function() {
  // 创建图片放大查看器
  const imageViewer = document.createElement('div');
  imageViewer.className = 'image-viewer';
  imageViewer.innerHTML = '<div class="image-viewer-container"><img src="" alt="" class="view-image"><span class="close-viewer">&times;</span></div>';
  document.body.appendChild(imageViewer);

  // 获取文章内容中的所有图片
  const postImages = document.querySelectorAll('.post-content img');

  // 为每张图片添加点击事件
  postImages.forEach(img => {
    img.style.cursor = 'pointer'; // 添加指针样式
    img.addEventListener('click', function() {
      const viewImage = imageViewer.querySelector('.view-image');
      viewImage.src = this.src;
      viewImage.alt = this.alt;
      imageViewer.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
  });

  // 点击关闭按钮或背景关闭放大查看器
  const closeViewer = imageViewer.querySelector('.close-viewer');
  closeViewer.addEventListener('click', closeImageViewer);
  imageViewer.addEventListener('click', function(e) {
    if (e.target === imageViewer) {
      closeImageViewer();
    }
  });

  function closeImageViewer() {
    imageViewer.classList.remove('active');
    document.body.style.overflow = ''; // 恢复背景滚动
  }

  // ESC键关闭放大查看器
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
      closeImageViewer();
    }
  });
});
