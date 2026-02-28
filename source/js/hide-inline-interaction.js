/**
 * hide-inline-interaction.js
 * Add click interaction for hideInline tags
 */

document.addEventListener("DOMContentLoaded", function () {
  const hideInlineElements = document.querySelectorAll(".hide-inline");

  // 1. 辅助函数：获取翻译
  // 我们尝试调用全局的翻译对象，如果不存在则返回原文本
  function t(text) {
    if (window.i18n && typeof window.i18n.get === "function") {
      return window.i18n.get(text);
    }
    return text;
  }

  hideInlineElements.forEach((element) => {
    let isRevealed = false;

    // 2. 初始状态翻译补救
    // 虽然 lang-switch.js 会翻译 innerText，但 data-display-text 属性里的值还是中文
    // 为了防止点击恢复后变回中文，我们���以在这里做个预处理（可选，但推荐）
    const rawDisplayText = element.getAttribute("data-display-text");
    if (rawDisplayText && window.i18n && window.i18n.isEn()) {
      // 如果当前是英文模式，但这属性还是中文，我们不用改属性，但在恢复时记得翻译它
    }

    element.addEventListener("click", function () {
      if (!isRevealed) {
        const hiddenContent = this.getAttribute("data-hidden-content");
        // 获取默认显示文本，通常是 "点击查看隐藏内容"
        const displayText =
          this.getAttribute("data-display-text") || "点击查看隐藏内容";

        // 保存原始样式
        const originalBgColor = this.style.backgroundColor;
        const originalTextColor = this.style.color;

        // 显示隐藏内容
        this.textContent = hiddenContent;
        this.style.backgroundColor = "transparent";
        this.style.color = "inherit";
        this.style.borderBottom = "none";
        this.style.cursor = "default";
        isRevealed = true;

        // 添加一个小的提示，表明可以点击恢复
        const restoreHint = document.createElement("span");

        // ★★★ 核心修改 1：翻译 "(点击恢复)" ★★★
        // 注意：这里是带空格的，确保你的 lang-switch.js 字典里有 " (点击恢复)"
        restoreHint.textContent = t(" (点击恢复)");

        restoreHint.style.fontSize = "0.8em";
        restoreHint.style.color = "#999";
        restoreHint.style.cursor = "pointer";

        this.appendChild(restoreHint);

        // 添加点击恢复功能
        restoreHint.addEventListener("click", function (e) {
          e.stopPropagation();

          // ★★★ 核心修改 2：翻译恢复后的文本 ★★★
          // 如果 displayText 是 "点击查看隐藏内容"，t() 会把它变成 "Click to reveal..."
          element.textContent = t(displayText);

          element.style.backgroundColor = originalBgColor;
          element.style.color = originalTextColor;
          element.style.borderBottom = "";
          element.style.cursor = "pointer";
          isRevealed = false;
        });
      }
    });
  });
});
