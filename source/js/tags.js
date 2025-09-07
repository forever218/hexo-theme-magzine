// 标签页切换功能
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有标签页按钮
  const tabButtons = document.querySelectorAll('.tab-btn');

  // 为每个按钮添加点击事件
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 获取标签页ID
      const tabId = this.getAttribute('data-tab');

      // 获取同一标签组中的所有按钮和内容项
      const parentTabs = this.closest('.tabs');
      const allButtons = parentTabs.querySelectorAll('.tab-btn');
      const allItems = parentTabs.querySelectorAll('.tab-item');

      // 移除所有按钮的active类
      allButtons.forEach(btn => btn.classList.remove('active'));

      // 隐藏所有内容项
      allItems.forEach(item => item.classList.remove('active'));

      // 为当前按钮添加active类
      this.classList.add('active');

      // 显示对应的内容项
      const targetItem = document.getElementById(tabId);
      if (targetItem) {
        targetItem.classList.add('active');
      }
    });
  });

  // 设置默认激活第一个标签
  document.querySelectorAll('.tabs').forEach(tabs => {
    const firstButton = tabs.querySelector('.tab-btn');
    if (firstButton && !firstButton.classList.contains('active')) {
      firstButton.click();
    }
  });
});
