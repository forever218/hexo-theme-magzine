
/**
 * hide-toggle-interaction.js
 * Add click interaction for hideToggle tags
 */

document.addEventListener('DOMContentLoaded', function() {
  const hideToggleElements = document.querySelectorAll('.hide-toggle');

  // 默认设置为折叠状态
  hideToggleElements.forEach(element => {
    element.classList.add('collapsed');
  });

  // 添加点击事件
  hideToggleElements.forEach(element => {
    const title = element.querySelector('.hide-toggle-title');

    title.addEventListener('click', function() {
      element.classList.toggle('collapsed');
    });
  });
});
