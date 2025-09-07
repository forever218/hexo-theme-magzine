

/**
 * hide-inline-interaction.js
 * Add click interaction for hideInline tags
 */

document.addEventListener('DOMContentLoaded', function() {
  const hideInlineElements = document.querySelectorAll('.hide-inline');

  hideInlineElements.forEach(element => {
    let isRevealed = false;

    element.addEventListener('click', function() {
      if (!isRevealed) {
        const hiddenContent = this.getAttribute('data-hidden-content');
        const displayText = this.getAttribute('data-display-text') || '点击查看隐藏内容';

        // 保存原始样式
        const originalBgColor = this.style.backgroundColor;
        const originalTextColor = this.style.color;

        // 显示隐藏内容
        this.textContent = hiddenContent;
        this.style.backgroundColor = 'transparent';
        this.style.color = 'inherit';
        this.style.borderBottom = 'none';
        this.style.cursor = 'default';
        isRevealed = true;

        // 添加一个小的提示，表明可以点击恢复
        const restoreHint = document.createElement('span');
        restoreHint.textContent = ' (点击恢复)';
        restoreHint.style.fontSize = '0.8em';
        restoreHint.style.color = '#999';
        restoreHint.style.cursor = 'pointer';

        this.appendChild(restoreHint);

        // 添加点击恢复功能
        restoreHint.addEventListener('click', function(e) {
          e.stopPropagation();
          element.textContent = displayText;
          element.style.backgroundColor = originalBgColor;
          element.style.color = originalTextColor;
          element.style.borderBottom = '';
          element.style.cursor = 'pointer';
          isRevealed = false;
        });
      }
    });
  });
});

