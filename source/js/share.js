
// 分享功能处理
document.addEventListener('DOMContentLoaded', function() {
  // 复制链接功能
  const copyButtons = document.querySelectorAll('.share-btn.copy');
  copyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const url = window.location.origin + this.getAttribute('data-copy');

      // 创建临时输入框
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      // 显示复制成功提示
      const originalText = this.querySelector('span').textContent;
      this.querySelector('span').textContent = '已复制!';
      setTimeout(() => {
        this.querySelector('span').textContent = originalText;
      }, 2000);
    });
  });

  // 微信分享功能
  const wechatButtons = document.querySelectorAll('.share-btn.wechat');
  wechatButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const url = window.location.origin + this.getAttribute('data-wechat');

      // 创建二维码弹窗
      const modal = document.createElement('div');
      modal.className = 'wechat-share-modal';
      modal.innerHTML = `
        <div class="wechat-share-container">
          <div class="wechat-share-header">
            <h3>微信扫一扫分享</h3>
            <button class="wechat-share-close">&times;</button>
          </div>
          <div class="wechat-share-body">
            <div id="wechat-qrcode"></div>
            <p>打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享至朋友圈。</p>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // 生成二维码
      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById("wechat-qrcode"), {
          text: url,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        // 如果QRCode库未加载，显示一个简单的二维码图片
        document.getElementById('wechat-qrcode').innerHTML = 
          `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code">`;
      }

      // 关闭弹窗
      const closeButton = modal.querySelector('.wechat-share-close');
      closeButton.addEventListener('click', function() {
        document.body.removeChild(modal);
      });

      // 点击背景关闭弹窗
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    });
  });
});
