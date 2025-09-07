// 代码高亮功能
document.addEventListener('DOMContentLoaded', function() {
  // 代码复制功能
  const copyButtons = document.querySelectorAll('.copy-button');

  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const target = this.closest('.highlight-tools').nextElementSibling;
      let code = '';

      if (target.tagName === 'PRE') {
        code = target.textContent;
      } else if (target.tagName === 'TABLE') {
        const codeElement = target.querySelector('.code pre');
        if (codeElement) {
          code = codeElement.textContent;
        }
      }

      if (code) {
        // 复制代码到剪贴板
        navigator.clipboard.writeText(code).then(() => {
          // 显示复制成功提示
          const notice = this.previousElementSibling;
          if (notice && notice.classList.contains('copy-notice')) {
            notice.style.opacity = '1';
            notice.textContent = '复制成功';

            setTimeout(() => {
              notice.style.opacity = '0';
            }, 2000);
          }
        }).catch(err => {
          console.error('复制失败:', err);

          // 显示复制失败提示
          const notice = this.previousElementSibling;
          if (notice && notice.classList.contains('copy-notice')) {
            notice.style.opacity = '1';
            notice.textContent = '复制失败';

            setTimeout(() => {
              notice.style.opacity = '0';
            }, 2000);
          }
        });
      }
    });
  });

  // 代码折叠功能
  const expandButtons = document.querySelectorAll('.expand');

  expandButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tools = this.closest('.highlight-tools');
      tools.classList.toggle('closed');
    });
  });

  // 代码高度限制和展开功能
  const codeExpandBtns = document.querySelectorAll('.code-expand-btn');

  codeExpandBtns.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.toggle('expand-done');
    });
  });
});
