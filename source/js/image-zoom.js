function getDist(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

document.addEventListener('DOMContentLoaded', function() {
  
  // 1. 定义 UI 图标 (SVGs)
  const icons = {
    rotate: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>'
  };

  // 2. 构建 DOM
  const imageViewer = document.createElement('div');
  imageViewer.className = 'image-viewer';
  
  imageViewer.innerHTML = `
    <div class="image-viewer-container">
      <img src="" alt="" class="view-image">
    </div>
    
    <!-- 这里没有 data-title，所以不会显示标签 -->
    <div class="close-btn">&times;</div>
    
    <div class="nav-btn prev" data-title="上一张">❮</div>
    <div class="nav-btn next" data-title="下一张">❯</div>
    
    <div class="viewer-toolbar">
      <button class="toolbar-btn rotate-btn" data-title="旋转90°">
        ${icons.rotate}
      </button>
      
      <button class="toolbar-btn lock-btn" data-title="锁定方向">
        ${icons.lock}
      </button>
      
      <button class="toolbar-btn download-btn" data-title="保存图片">
        ${icons.download}
      </button>
    </div>
  `;
  document.body.appendChild(imageViewer);

  // 获取元素
  const viewImage = imageViewer.querySelector('.view-image');
  const btnClose = imageViewer.querySelector('.close-btn');
  const btnPrev = imageViewer.querySelector('.prev');
  const btnNext = imageViewer.querySelector('.next');
  const btnRotate = imageViewer.querySelector('.rotate-btn');
  const btnLock = imageViewer.querySelector('.lock-btn');
  const btnDownload = imageViewer.querySelector('.download-btn');

  const allImages = Array.from(document.querySelectorAll('.post-content img'));
  if (allImages.length === 0) return; 

  let currentIndex = 0;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotation = 0;
  let isLocked = false;

  let isDragging = false;
  let startX = 0, startY = 0;
  let lastTouchX = 0, lastTouchY = 0;
  let startDist = 0, startScale = 1;

  // 3. 逻辑函数
  function updateTransform(useAnim = false) {
    viewImage.style.transition = useAnim ? 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none';
    viewImage.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scale})`;
  }

  function resetState() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    rotation = 0;
    updateTransform(true);
  }

  function loadImage(index) {
    // 逻辑：严格限制索引，防止越界（虽然按钮禁用了，但键盘操作需要这个检查）
    if (index < 0 || index >= allImages.length) return;
    
    currentIndex = index;
    
    viewImage.style.opacity = '0.5';
    setTimeout(() => viewImage.style.opacity = '1', 150);

    const target = allImages[currentIndex];
    viewImage.src = target.src;
    viewImage.alt = target.alt || '';

    // ★★★ 核心逻辑保留：通过 CSS 类名禁用按钮 ★★★
    // 第一张时，禁用“上一张”
    if (currentIndex === 0) {
        btnPrev.classList.add('disabled');
    } else {
        btnPrev.classList.remove('disabled');
    }

    // 最后一张时，禁用“下一张”
    if (currentIndex === allImages.length - 1) {
        btnNext.classList.add('disabled');
    } else {
        btnNext.classList.remove('disabled');
    }

    resetState();
  }

  function openViewer(index) {
    loadImage(index);
    imageViewer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    imageViewer.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 4. 事件绑定
  allImages.forEach((img, idx) => {
    img.addEventListener('click', () => openViewer(idx));
  });

  btnClose.addEventListener('click', closeViewer);
  imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer || e.target.classList.contains('image-viewer-container')) {
      closeViewer();
    }
  });

  // 只有没被禁用时才响应点击
  btnPrev.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      if (!btnPrev.classList.contains('disabled')) loadImage(currentIndex - 1); 
  });
  
  btnNext.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      if (!btnNext.classList.contains('disabled')) loadImage(currentIndex + 1); 
  });

  btnRotate.addEventListener('click', (e) => {
    e.stopPropagation();
    rotation += 90;
    updateTransform(true);
  });

  btnLock.addEventListener('click', (e) => {
    e.stopPropagation();
    isLocked = !isLocked;
    btnLock.classList.toggle('active', isLocked);
  });

  btnDownload.addEventListener('click', (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = viewImage.src;
    link.download = viewImage.src.split('/').pop().split('?')[0] || `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  document.addEventListener('keydown', (e) => {
    if (!imageViewer.classList.contains('active')) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowLeft') {
        if (!btnPrev.classList.contains('disabled')) loadImage(currentIndex - 1);
    }
    if (e.key === 'ArrowRight') {
        if (!btnNext.classList.contains('disabled')) loadImage(currentIndex + 1);
    }
  });

  globalThis.addEventListener('orientationchange', () => {
    if (isLocked) return;
    setTimeout(resetState, 300);
  });

  // 5. 拖拽与缩放
  imageViewer.addEventListener('wheel', (e) => {
    if (!imageViewer.classList.contains('active')) return;
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    scale = Math.min(Math.max(0.1, scale + delta), 10);
    updateTransform();
  });

  viewImage.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    viewImage.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      viewImage.style.cursor = 'grab';
    }
  });

  viewImage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      startDist = getDist(e.touches[0], e.touches[1]);
      startScale = scale;
    }
  }, { passive: false });

  viewImage.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      translateX += dx;
      translateY += dy;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      updateTransform();
    } else if (e.touches.length === 2) {
      const newDist = getDist(e.touches[0], e.touches[1]);
      if (newDist > 0 && startDist > 0) {
        scale = Math.min(Math.max(0.1, startScale * (newDist / startDist)), 10);
        updateTransform();
      }
    }
  }, { passive: false });
});