// 代码高亮功能 - 前端运行脚本
document.addEventListener('DOMContentLoaded', function() {
  // 修复带行号的代码块结构
  fixLineNumbersCodeBlocks();

  // 代码复制功能
  const copyButtons = document.querySelectorAll('.copy-button');

  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 1. 找到对应的代码容器
      const tools = this.closest('.highlight-tools');
      if (!tools) return;
      
      const highlightWrap = tools.closest('.highlight-wrap') || tools.parentElement;
      let code = '';
      
      // 2. 尝试获取代码文本
      // 策略A: 查找表格结构 (Hexo 默认带行号)
      const tableCode = highlightWrap.querySelector('td.code');
      if (tableCode) {
        // 使用 innerText 可以保留换行，但在不同浏览器行为不一
        // 最稳妥的是提取每一行的数据
        const lines = tableCode.querySelectorAll('.line');
        if (lines.length > 0) {
          code = Array.from(lines).map(line => line.textContent).join('\n');
        } else {
          // 如果没有 .line 结构，直接取 innerText
          code = tableCode.innerText;
        }
      } 
      // 策略B: 查找纯 pre 结构 (Hexo 不带行号)
      else {
        const preCode = highlightWrap.querySelector('pre');
        if (preCode) {
          code = preCode.innerText;
        }
      }
      
      // 3. 执行复制
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          showCopySuccess(this);
        }).catch(err => {
          console.error('复制失败:', err);
          showCopyError(this);
        });
      } else {
        console.warn('未找到代码内容');
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
      // 切换图标
      const icon = this.querySelector('i');
      if (icon) {
        if (this.classList.contains('expand-done')) {
          icon.classList.remove('fa-angle-double-down');
          icon.classList.add('fa-angle-double-up');
        } else {
          icon.classList.remove('fa-angle-double-up');
          icon.classList.add('fa-angle-double-down');
        }
      }
    });
  });
});

// 显示复制成功提示
function showCopySuccess(button) {
  const notice = button.previousElementSibling;
  if (notice && notice.classList.contains('copy-notice')) {
    notice.style.opacity = '1';
    notice.textContent = '复制成功';
    setTimeout(() => {
      notice.style.opacity = '0';
    }, 2000);
  } else {
    // 兼容 FontAwesome 图标变化
    const originalClass = button.className;
    button.className = 'fas fa-check copy-button';
    setTimeout(() => {
      button.className = originalClass;
    }, 2000);
  }
}

// 显示复制失败提示
function showCopyError(button) {
  const notice = button.previousElementSibling;
  if (notice && notice.classList.contains('copy-notice')) {
    notice.style.opacity = '1';
    notice.textContent = '复制失败';
    setTimeout(() => {
      notice.style.opacity = '0';
    }, 2000);
  }
}

// 修复带行号的代码块结构（针对未经过 filter 处理的情况）
function fixLineNumbersCodeBlocks() {
  // 查找所有包含表格的代码块
  const codeBlocks = document.querySelectorAll('figure.highlight table');
  
  codeBlocks.forEach(table => {
    const figure = table.closest('figure.highlight');
    if (!figure) return;
    
    // 如果已经有 highlight-tools 了（比如被 filter 处理过了），就跳过
    if (figure.querySelector('.highlight-tools') || figure.closest('.highlight-wrap')) return;
    
    // 创建工具栏
    const tools = document.createElement('div');
    tools.className = 'highlight-tools';
    
    // 添加语言标签
    const caption = figure.querySelector('figcaption, .caption');
    if (caption) {
        // ... (保留之前的逻辑)
    } else {
        const langClass = Array.from(figure.classList).find(cls => cls !== 'highlight');
        if (langClass) {
            const langSpan = document.createElement('span');
            langSpan.className = 'code-lang';
            langSpan.textContent = langClass;
            tools.appendChild(langSpan);
        }
    }
    
    // 添加复制按钮
    const copyNotice = document.createElement('span');
    copyNotice.className = 'copy-notice';
    tools.appendChild(copyNotice);
    
    const copyButton = document.createElement('i');
    copyButton.className = 'fas fa-copy copy-button';
    tools.appendChild(copyButton);
    
    figure.insertBefore(tools, table);
  });
}