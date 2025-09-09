// 代码高亮功能
document.addEventListener('DOMContentLoaded', function() {
  // 修复带行号的代码块结构
  fixLineNumbersCodeBlocks();

  // 代码复制功能
  const copyButtons = document.querySelectorAll('.copy-button');

  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tools = this.closest('.highlight-tools');
      if (!tools) return;
      
      // 获取代码元素，支持多种结构
      let codeElement = null;
      let target = tools.nextElementSibling;
      
      if (target) {
        if (target.tagName === 'PRE') {
          codeElement = target;
        } else if (target.tagName === 'TABLE') {
          codeElement = target.querySelector('.code pre');
        } else if (target.classList && target.classList.contains('highlight-body')) {
          codeElement = target.querySelector('pre');
        }
      }
      
      if (!codeElement) {
        // 尝试其他可能的代码元素位置
        const highlightFig = tools.closest('figure.highlight');
        if (highlightFig) {
          codeElement = highlightFig.querySelector('.code pre, pre');
        }
      }
      
      let code = '';
      if (codeElement) {
        code = codeElement.textContent;
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
      if (tools) {
        tools.classList.toggle('closed');
      }
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

// 修复带行号的代码块结构
function fixLineNumbersCodeBlocks() {
  // 查找所有包含表格的代码块
  const codeBlocks = document.querySelectorAll('figure.highlight table');
  
  codeBlocks.forEach(table => {
    const figure = table.closest('figure.highlight');
    if (!figure) return;
    
    // 检查是否已经有工具栏
    let tools = figure.querySelector('.highlight-tools');
    if (!tools) {
      // 创建工具栏
      tools = document.createElement('div');
      tools.className = 'highlight-tools';
      
      // 添加语言标签（如果有）
      const caption = figure.querySelector('figcaption, .caption');
      if (caption) {
        const lang = caption.textContent.trim();
        const langSpan = document.createElement('span');
        langSpan.className = 'code-lang';
        langSpan.textContent = lang;
        tools.appendChild(langSpan);
      }
      
      // 添加复制按钮
      const copyNotice = document.createElement('span');
      copyNotice.className = 'copy-notice';
      tools.appendChild(copyNotice);
      
      const copyButton = document.createElement('span');
      copyButton.className = 'copy-button';
      copyButton.innerHTML = '<i class="far fa-copy"></i>';
      tools.appendChild(copyButton);
      

      
      // 将工具栏插入到表格之前
      figure.insertBefore(tools, table);
    }
    
  });
}
