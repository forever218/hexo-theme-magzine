// 分享功能处理
document.addEventListener("DOMContentLoaded", function () {
  // 1. 辅助翻译函数
  function t(text) {
    if (window.i18n && typeof window.i18n.get === "function") {
      return window.i18n.get(text);
    }
    return text;
  }

  // 复制链接功能
  const copyButtons = document.querySelectorAll(".share-btn.copy");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      // 获取完整 URL
      const url = this.getAttribute("data-copy");
      // 注意：有些 data-copy 可能只是路径，有些是全链接，根据你原来的逻辑调整
      // 原代码：const url = window.location.origin + this.getAttribute('data-copy');
      // 如果 data-copy 只是路径，就用下面的；如果是全链接，就直接用 url
      const finalUrl = url.startsWith("http")
        ? url
        : window.location.origin + url;

      // 创建临时输入框复制
      const tempInput = document.createElement("input");
      tempInput.value = finalUrl;
      document.body.appendChild(tempInput);
      tempInput.select();

      try {
        document.execCommand("copy");

        // ★★★ 修改点 1：翻译 "已复制!" ★★★
        const span = this.querySelector("span");
        const originalText = span.textContent;
        span.textContent = t("已复制!");

        setTimeout(() => {
          span.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error("Copy failed", err);
      }

      document.body.removeChild(tempInput);
    });
  });

  // ================= 微信分享功能 (样式还原版) =================
  const wechatButtons = document.querySelectorAll(".share-btn.wechat");

  // 1. 定义关闭函数
  function closeWechatModal() {
    const existingModal = document.querySelector(".wechat-share-modal");
    if (existingModal) {
      existingModal.remove();
      // 移除全局监听器，防止内存泄漏
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("keydown", handleEscKey);
    }
  }

  // 2. 处理全局点击的函数 (核心修复逻辑)
  function handleGlobalClick(event) {
    const modal = document.querySelector(".wechat-share-modal");
    if (!modal) return;

    const container = modal.querySelector(".wechat-share-container");

    // A. 如果点击的是关闭按钮 (或其子元素)
    if (event.target.closest(".wechat-share-close")) {
      closeWechatModal();
      return;
    }

    // B. 如果点击的目标 **不在** 内容容器内部 (说明点到了背景遮罩)
    // 且 content 存在
    if (container && !container.contains(event.target)) {
      closeWechatModal();
    }
  }

  // 3. 处理 ESC 键的函数
  function handleEscKey(event) {
    if (event.key === "Escape") {
      closeWechatModal();
    }
  }

  wechatButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // 阻止冒泡

      // 先关闭可能存在的旧弹窗
      closeWechatModal();

      const urlPath = this.getAttribute("data-wechat");
      const url = urlPath.startsWith("http")
        ? urlPath
        : window.location.origin + urlPath;

      // 创建弹窗 (不带强制内联样式，使用你原来的 CSS 类)
      const modal = document.createElement("div");
      modal.className = "wechat-share-modal";

      // 翻译文本
      const titleText = t("微信扫一扫分享");
      const descText = t(
        '打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享至朋友圈。',
      );

      // 恢复原本的 HTML 结构，不加 style 属性
      modal.innerHTML = `
        <div class="wechat-share-container">
          <div class="wechat-share-header">
            <h3>${titleText}</h3>
            <button class="wechat-share-close" type="button">&times;</button>
          </div>
          <div class="wechat-share-body">
            <div id="wechat-qrcode"></div>
            <p>${descText}</p>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // 生成二维码
      // 使用 setTimeout 0 确保 DOM 插入后再生成，避免某些情况下获取不到容器
      setTimeout(() => {
        const qrContainer = modal.querySelector("#wechat-qrcode");
        if (qrContainer) {
          if (typeof QRCode !== "undefined") {
            new QRCode(qrContainer, {
              text: url,
              width: 200,
              height: 200,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H,
            });
          } else {
            qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code">`;
          }
        }
      }, 0);

      // ★ 绑定全局关闭事件 (延迟 100ms 绑定，避开当前点击)
      setTimeout(() => {
        document.addEventListener("click", handleGlobalClick);
        document.addEventListener("keydown", handleEscKey);
      }, 100);
    });
  });
});
