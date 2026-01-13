// 图片点击放大功能
document.addEventListener('DOMContentLoaded', function() {
  // 创建图片放大查看器
  const imageViewer = document.createElement('div');
  imageViewer.className = 'image-viewer';
  imageViewer.innerHTML = '<div class="image-viewer-container"><img src="" alt="" class="view-image"><span class="close-viewer">&times;</span></div>';
  document.body.appendChild(imageViewer);

  // 获取查看器中的图片元素
  const viewImage = imageViewer.querySelector('.view-image');
  
  // 缩放和平移的状态变量
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // 更新图片变换样式的函数
  function updateTransform() {
    viewImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // 滚轮缩放事件
  viewImage.addEventListener('wheel', function(e) {
    e.preventDefault(); // 防止滚动页面
    
    // 计算缩放增量，0.001 是灵敏度，可根据需要调整
    // deltaY 向上滚动通常是负值（放大），向下是正值（缩小）
    const delta = e.deltaY * -0.001; 
    
    // 限制缩放范围，例如最小 0.5 倍，最大 5 倍
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    
    scale = newScale;
    updateTransform();
  });

  // 鼠标按下开始拖拽
  viewImage.addEventListener('mousedown', function(e) {
    // 只有在左键按下且通常是放大状态下才开始拖拽（也可以允许随时拖拽）
    if (e.button === 0) { 
      isDragging = true;
      // 记录鼠标起始位置与当前图片偏移量的差值
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      viewImage.style.cursor = 'grabbing'; // 改变鼠标样式
      e.preventDefault();
    }
  });

  // 鼠标移动处理拖拽（绑定在 document 上以防鼠标移出图片范围）
  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  });

  // 鼠标松开停止拖拽
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      viewImage.style.cursor = 'grab'; // 恢复为可抓取样式
    }
  });

  // 获取文章内容中的所有图片
  const postImages = document.querySelectorAll('.post-content img');

  // 为每张图片添加点击事件
  postImages.forEach(img => {
    img.style.cursor = 'pointer'; 
    img.addEventListener('click', function() {
      viewImage.src = this.src;
      viewImage.alt = this.alt;
      
      // 每次打开图片时重置缩放和位置
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      viewImage.style.cursor = 'grab'; // 初始化鼠标样式

      imageViewer.classList.add('active');
      document.body.style.overflow = 'hidden'; 
    });
  });

  // 点击关闭按钮或背景关闭放大查看器
  const closeViewer = imageViewer.querySelector('.close-viewer');
  closeViewer.addEventListener('click', closeImageViewer);
  imageViewer.addEventListener('click', function(e) {
    if (e.target === imageViewer || e.target.classList.contains('image-viewer-container')) {
      closeImageViewer();
    }
  });

  function closeImageViewer() {
    imageViewer.classList.remove('active');
    document.body.style.overflow = ''; 
    // 关闭时也可以选择重置，防止下次打开有残留动画
    setTimeout(() => {
        scale = 1; 
        translateX = 0; 
        translateY = 0; 
        updateTransform();
    }, 300);
  }

  // ESC键关闭放大查看器
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
      closeImageViewer();
    }
  });
});