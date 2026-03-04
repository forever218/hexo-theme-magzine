// 代码高亮功能 - 前端运行脚本
document.addEventListener("DOMContentLoaded", function () {
  // 辅助函数：安全翻译
  function t(text) {
    if (window.i18n && typeof window.i18n.get === "function") {
      return window.i18n.get(text);
    }
    return text;
  }

  // 修复带行号的代码块结构
  fixLineNumbersCodeBlocks();

  // 代码复制功能
  const copyButtons = document.querySelectorAll(".copy-button");

  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 1. 找到对应的代码容器
      const tools = this.closest(".highlight-tools");
      if (!tools) return;

      const highlightWrap =
        tools.closest(".highlight-wrap") || tools.parentElement;
      let code = "";

      // 2. 尝试获取代码文本
      // 策略A: 查找表格结构 (Hexo 默认带行号)
      const tableCode = highlightWrap.querySelector("td.code");
      if (tableCode) {
        const lines = tableCode.querySelectorAll(".line");
        if (lines.length > 0) {
          code = Array.from(lines)
            .map((line) => line.textContent)
            .join("\n");
        } else {
          code = tableCode.innerText;
        }
      }
      // 策略B: 查找纯 pre 结构 (Hexo 不带行号)
      else {
        const preCode = highlightWrap.querySelector("pre");
        if (preCode) {
          code = preCode.innerText;
        }
      }

      // 3. 执行复制
      if (code) {
        navigator.clipboard
          .writeText(code)
          .then(() => {
            showCopySuccess(this);
          })
          .catch((err) => {
            console.error("复制失败:", err);
            showCopyError(this);
          });
      } else {
        console.warn("未找到代码内容");
        // 可选：如果这里有UI提示，也可以用 t('未找到代码内容')
      }
    });
  });

  // ... (中间的折叠功能代码保持不变) ...
  const expandButtons = document.querySelectorAll(".expand");
  expandButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tools = this.closest(".highlight-tools");
      if (tools) {
        tools.classList.toggle("closed");
      }
    });
  });

  const codeExpandBtns = document.querySelectorAll(".code-expand-btn");
  codeExpandBtns.forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.toggle("expand-done");
      const icon = this.querySelector("i");
      if (icon) {
        if (this.classList.contains("expand-done")) {
          icon.classList.remove("fa-angle-double-down");
          icon.classList.add("fa-angle-double-up");
        } else {
          icon.classList.remove("fa-angle-double-up");
          icon.classList.add("fa-angle-double-down");
        }
      }
    });
  });

  // 显示复制成功提示
  function showCopySuccess(button) {
    const notice = button.previousElementSibling;
    if (notice && notice.classList.contains("copy-notice")) {
      notice.style.opacity = "1";
      // ★★★ 修改点：使用翻译 ★★★
      notice.textContent = t("复制成功");
      setTimeout(() => {
        notice.style.opacity = "0";
      }, 2000);
    } else {
      const originalClass = button.className;
      button.className = "fas fa-check copy-button";
      setTimeout(() => {
        button.className = originalClass;
      }, 2000);
    }
  }

  // 显示复制失败提示
  function showCopyError(button) {
    const notice = button.previousElementSibling;
    if (notice && notice.classList.contains("copy-notice")) {
      notice.style.opacity = "1";
      // ★★★ 修改点：使用翻译 ★★★
      notice.textContent = t("复制失败");
      setTimeout(() => {
        notice.style.opacity = "0";
      }, 2000);
    }
  }
});

// 修复带行号的代码块结构
function fixLineNumbersCodeBlocks() {
  const codeBlocks = document.querySelectorAll("figure.highlight table");

  codeBlocks.forEach((table) => {
    const figure = table.closest("figure.highlight");
    if (!figure) return;

    // 如果已经有 highlight-tools 了，就跳过
    if (
      figure.querySelector(".highlight-tools") ||
      figure.closest(".highlight-wrap")
    )
      return;

    // 创建工具栏
    const tools = document.createElement("div");
    tools.className = "highlight-tools";

    // --- 这里就是你补充的那段逻辑 ---
    // 添加语言标签（如果有标题 caption，优先显示标题）
    const caption = figure.querySelector("figcaption, .caption");
    if (caption) {
      const lang = caption.textContent.trim();
      const langSpan = document.createElement("span");
      langSpan.className = "code-lang";
      langSpan.textContent = lang;
      tools.appendChild(langSpan);

      // 可选：为了防止标题重复显示（工具栏显示了，下面原标题也显示），可以隐藏原标题
      // caption.style.display = 'none';
    } else {
      // 如果没有caption，尝试从class中获取语言 (例如 class="highlight python")
      const langClass = Array.from(figure.classList).find(
        (cls) => cls !== "highlight",
      );
      if (langClass && langClass !== "plain") {
        const langSpan = document.createElement("span");
        langSpan.className = "code-lang";
        langSpan.textContent = langClass.toUpperCase(); // 转大写好看一点
        tools.appendChild(langSpan);
      }
    }
    // --------------------------------

    // 添加复制成功/失败提示
    const copyNotice = document.createElement("span");
    copyNotice.className = "copy-notice";
    tools.appendChild(copyNotice);

    // 添加复制按钮
    const copyButton = document.createElement("i");
    copyButton.className = "fas fa-copy copy-button";
    tools.appendChild(copyButton);

    // 将工具栏插入到表格之前
    figure.insertBefore(tools, table);
  });
}
