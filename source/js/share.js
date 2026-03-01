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

  // 微信分享功能
  const wechatButtons = document.querySelectorAll(".share-btn.wechat");
  wechatButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const urlPath = this.getAttribute("data-wechat");
      const url = urlPath.startsWith("http")
        ? urlPath
        : window.location.origin + urlPath;

      // 创建二维码弹窗
      const modal = document.createElement("div");
      modal.className = "wechat-share-modal";

      // ★★★ 修改点 2：翻译微信弹窗内容 ★★★
      const titleText = t("微信扫一扫分享");
      const descText = t(
        '打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享至朋友圈。',
      );

      modal.innerHTML = `
        <div class="wechat-share-container">
          <div class="wechat-share-header">
            <h3>${titleText}</h3>
            <button class="wechat-share-close">&times;</button>
          </div>
          <div class="wechat-share-body">
            <div id="wechat-qrcode"></div>
            <p>${descText}</p>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // 生成二维码逻辑 (保持不变)
      const qrContainer = document.getElementById("wechat-qrcode");
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

      // 关闭弹窗逻辑 (保持不变)
      const closeButton = modal.querySelector(".wechat-share-close");
      closeButton.addEventListener("click", function () {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      });

      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          if (document.body.contains(modal)) {
            document.body.removeChild(modal);
          }
        }
      });
    });
  });
});
