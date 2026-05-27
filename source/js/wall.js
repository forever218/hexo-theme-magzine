document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("twikoo-modal");
  const btnOpen = document.getElementById("leave-msg-btn");
  const btnClose = document.getElementById("close-modal-btn");
  const overlay = document.querySelector(".wall-modal-overlay");
  const wallContainer = document.getElementById("photo-wall-container");
  const emptyTip = document.getElementById("wall-empty-tip");

  let zIndexCounter = 10;

  // 1. 模态框开关逻辑
  function toggleModal(show) {
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
  }
  btnOpen.addEventListener("click", () => toggleModal(true));
  btnClose.addEventListener("click", () => toggleModal(false));
  overlay.addEventListener("click", () => toggleModal(false));

  // ==========================================
  // 2. 监听全局评论区的加载并渲染照片
  // ==========================================
  function renderPhotos() {
    // 兼容检测 Twikoo 等评论系统的评论元素
    const comments = document.querySelectorAll(
      ".tk-comment, .vcard, .gt-comment",
    );

    if (comments.length > 0 && emptyTip) {
      emptyTip.style.display = "none"; // 隐藏"留下足迹"提示
    } else if (emptyTip) {
      emptyTip.style.display = "block";
    }

    // 清空现有相片
    document.querySelectorAll(".photo-card").forEach((el) => el.remove());

    comments.forEach((comment, index) => {
      // 提取作者名字（兼容 Twikoo, Valine, Gitalk）
      const authorEl = comment.querySelector(
        ".tk-nick, .vnick, .gt-comment-username",
      );
      // ★ 将 innerText 改为 textContent
      const author = authorEl ? authorEl.textContent.trim() : "匿名";

      // 提取留言内容（兼容 Twikoo, Valine, Gitalk）
      const contentEl = comment.querySelector(
        ".tk-content, .vcontent, .gt-comment-body",
      );

      // ★ 将 innerText 改为 textContent，并过滤掉多余的换行符
      let message = "什么也没留下~";
      if (contentEl) {
        // 获取文本，并将多个空格、换行替换为单空格
        message = contentEl.textContent.replace(/\s+/g, " ").trim();
      }

      if (message.length > 60) message = message.substring(0, 60) + "...";

      // 按顺序选取配置的图片，避免乱跳
      const images = window.photoWallImages || [];
      const randomImg =
        images.length > 0 ? images[index % images.length] : "/images/0.png";

      // 传入 message
      createPhotoCard(author, message, randomImg, index);
    });
  }

  // 使用 MutationObserver 监听评论容器，当评论加载完毕时自动生成照片
  // Twikoo默认渲染在 #twikoo 中
  const commentContainer =
    document.getElementById("twikoo") ||
    document.getElementById("valine-comments") ||
    document.getElementById("gitalk-container");

  if (commentContainer) {
    const observer = new MutationObserver((mutations) => {
      let shouldRender = false;
      mutations.forEach((mutation) => {
        if (
          mutation.addedNodes.length > 0 ||
          mutation.removedNodes.length > 0
        ) {
          shouldRender = true;
        }
      });
      if (shouldRender) {
        renderPhotos();
      }
    });
    // 开始监听评论区 DOM 的变化
    observer.observe(commentContainer, { childList: true, subtree: true });

    // 初始尝试渲染一次 (应对网页秒开、缓存加载的情况)
    setTimeout(renderPhotos, 500);
  }

  // ==========================================
  // 3. 创建相片卡片 (采用伪随机算法固定坐标)
  // ==========================================
  function createPhotoCard(author, message, imgSrc, index) {
    // 伪随机函数：确保同一张照片每次刷新都在同一个固定位置，避免乱飞
    function seededRandom(seed) {
      const x = Math.sin(seed + 1) * 10000;
      return x - Math.floor(x);
    }

    const card = document.createElement("div");
    card.className = "photo-card";

    const maxX = wallContainer.clientWidth - 220;
    const maxY = wallContainer.clientHeight - 260;
    const safeMaxX = Math.max(0, maxX);
    const safeMaxY = Math.max(0, maxY);

    // 使用固定的 index 种子生成位置和角度
    const randomX = Math.floor(seededRandom(index) * safeMaxX);
    const randomY = Math.floor(seededRandom(index + 1000) * safeMaxY);
    const randomRotation = Math.floor(seededRandom(index + 2000) * 40) - 20;

    card.style.left = `${randomX}px`;
    card.style.top = `${randomY}px`;
    card.style.transform = `rotate(${randomRotation}deg)`;

    // 保存初始倾斜角度到元素上，方便拖拽结束后恢复
    card.dataset.rotation = randomRotation;

    // 添加留言和作者结构
    card.innerHTML = `
      <img src="${imgSrc}" alt="photo">
      <div class="message">${message}</div>
      <div class="author">${author}</div>
    `;

    makeDraggable(card);
    wallContainer.appendChild(card);
  }

  // ==========================================
  // 4. 拖拽实现
  // ==========================================
  function makeDraggable(el) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    el.addEventListener("mousedown", startDrag);
    el.addEventListener("touchstart", startDrag, { passive: true });

    function startDrag(e) {
      isDragging = true;
      el.style.zIndex = ++zIndexCounter;
      el.style.transform = "scale(1.05) rotate(0deg)"; // 拖拽时摆正并放大
      el.style.transition = "transform 0.1s ease";

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      startX = clientX;
      startY = clientY;
      initialLeft = el.offsetLeft;
      initialTop = el.offsetTop;

      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      el.style.left = `${initialLeft + dx}px`;
      el.style.top = `${initialTop + dy}px`;
    }

    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;

      // 停止拖拽时恢复原本的随机倾斜角
      const rotation = el.dataset.rotation || 0;
      el.style.transform = `rotate(${rotation}deg)`;
      el.style.transition = "transform 0.3s ease";

      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("touchend", stopDrag);
    }
  }
});
