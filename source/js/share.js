// 分享功能处理 (自动获取当前页面真实链接版)
document.addEventListener("DOMContentLoaded", function () {
  // 1. 辅助翻译函数
  function t(text) {
    if (window.i18n && typeof window.i18n.get === "function") {
      return window.i18n.get(text);
    }
    return text;
  }

  // 辅助函数：获取当前页面的完整 URL (去除 hash 锚点)
  function getCurrentPageUrl() {
    return window.location.href.split("#")[0];
  }

  // ================= 1. 复制链接功能 =================
  const copyButtons = document.querySelectorAll(".share-btn.copy");
  copyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // ★★★ 修改：直接使用当前浏览器地址栏的 URL ★★★
      const finalUrl = getCurrentPageUrl();

      // 创建临时输入框复制
      if (navigator.clipboard && window.isSecureContext) {
        // 现代 API
        navigator.clipboard
          .writeText(finalUrl)
          .then(() => {
            showCopySuccess(this);
          })
          .catch((err) => {
            console.error("Async: Could not copy text: ", err);
            fallbackCopyTextToClipboard(finalUrl, this);
          });
      } else {
        // 兼容旧浏览器
        fallbackCopyTextToClipboard(finalUrl, this);
      }
    });
  });

  // 复制回退方案
  function fallbackCopyTextToClipboard(text, button) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand("copy");
      showCopySuccess(button);
    } catch (err) {
      console.error("Copy failed", err);
    }
    document.body.removeChild(tempInput);
  }

  // 显示"已复制"提示
  function showCopySuccess(button) {
    const span = button.querySelector("span");
    if (span) {
      const originalText = span.textContent;
      span.textContent = t("已复制!");
      setTimeout(() => {
        span.textContent = originalText;
      }, 2000);
    }
  }

  // ================= 2. 微信分享功能 (自动生成当前页二维码) =================
  const wechatButtons = document.querySelectorAll(".share-btn.wechat");

  // 定义关闭函数
  function closeWechatModal() {
    const existingModal = document.querySelector(".wechat-share-modal");
    if (existingModal) {
      existingModal.remove();
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("keydown", handleEscKey);
    }
  }

  // 全局点击监听
  function handleGlobalClick(event) {
    const modal = document.querySelector(".wechat-share-modal");
    if (!modal) return;
    const container = modal.querySelector(".wechat-share-container");
    // 如果点击关闭按钮 OR 点击了遮罩层(不在容器内)
    if (
      event.target.closest(".wechat-share-close") ||
      (container && !container.contains(event.target))
    ) {
      closeWechatModal();
    }
  }

  // ESC 键监听
  function handleEscKey(event) {
    if (event.key === "Escape") closeWechatModal();
  }

  wechatButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      closeWechatModal();

      // ★★★ 修改：直接使用当前浏览器地址栏的 URL 生成二维码 ★★★
      const url = getCurrentPageUrl();

      const modal = document.createElement("div");
      modal.className = "wechat-share-modal";

      const titleText = t("微信扫一扫分享");
      const descText = t(
        '打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享至朋友圈。',
      );

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

      // 生成二维码逻辑
      setTimeout(() => {
        const qrContainer = modal.querySelector("#wechat-qrcode");
        if (qrContainer) {
          // 清空容器，防止重复
          qrContainer.innerHTML = "";

          // 优先使用 QRCode 库 (如果是本地库)
          if (typeof QRCode !== "undefined") {
            try {
              new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H,
              });
            } catch (error) {
              console.error(
                "QRCode library failed, trying API fallback...",
                error,
              );
              useApiFallback(qrContainer, url);
            }
          } else {
            // 如果没有库，使用 API 兜底
            useApiFallback(qrContainer, url);
          }
        }
      }, 50);

      // 绑定关闭事件
      setTimeout(() => {
        document.addEventListener("click", handleGlobalClick);
        document.addEventListener("keydown", handleEscKey);
      }, 100);
    });
  });

  // 使用 API 生成二维码的兜底函数 (使用国内访问较快的 API)
  function useApiFallback(container, url) {
    // 尝试使用不同的 API 服务，这里使用 qrserver (通常比较稳定)
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

    const img = new Image();
    img.alt = "Scan to share";
    img.style.maxWidth = "100%";
    img.style.height = "auto";

    // 加载中提示
    container.textContent = "Loading QR...";

    img.onload = function () {
      container.innerHTML = ""; // 清除文字
      container.appendChild(img);
    };

    img.onerror = function () {
      container.textContent = "QR Code Load Failed";
    };

    img.src = apiUrl;
  }
});
