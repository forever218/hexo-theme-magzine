/**
 * Table of Contents Generator
 * 自动生成文章目录并实现导航功能
 */

document.addEventListener("DOMContentLoaded", function () {
  // 获取文章内容区域
  const postContent = document.querySelector(".post-content");

  // 如果文章内容区域不存在，则不执行后续操作
  if (!postContent) return;

  // 获取目录容器
  const tocContainer = document.getElementById("table-of-contents");

  // 如果目录容器不存在，则不执行后续操作
  if (!tocContainer) return;

  // 获取所有标题元素
  const headings = postContent.querySelectorAll("h1, h2, h3, h4, h5, h6");

  // 如果没有标题，则隐藏整个目录侧边栏
  if (headings.length === 0) {
    const tocSidebar = document.querySelector(".toc-sidebar");
    if (tocSidebar) {
      // 获取配置选项，默认为hide
      const emptyTocBehavior =
        typeof tocConfig !== "undefined" && tocConfig.empty_toc_behavior
          ? tocConfig.empty_toc_behavior
          : "hide";

      if (emptyTocBehavior === "hide") {
        // 隐藏目录侧边栏，并调整主内容区域宽度为全屏
        tocSidebar.style.display = "none";

        // 调整主内容区域的宽度，使其占据全部空间
        const postContainer = document.querySelector(".post-container");
        if (postContainer) {
          postContainer.style.marginLeft = "0";
          postContainer.style.maxWidth = "100%";
        }
      } else if (emptyTocBehavior === "placeholder") {
        // 保持目录侧边栏占位，但隐藏目录内容
        const tocContent = tocSidebar.querySelector(".toc-content");
        if (tocContent) {
          tocContent.style.display = "none";
        }

        // 显示"无目录"提示
        const tocTitle = tocSidebar.querySelector(".toc-title");
        if (tocTitle) {
          tocTitle.textContent = "无目录";
        }
      }
    }
    return;
  }

  // 创建目录列表
  const tocList = document.createElement("ul");

  // 为每个标题生成目录项
  headings.forEach((heading, index) => {
    // 如果标题没有ID，则为其生成一个ID
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    // 创建目录项
    const tocItem = document.createElement("li");
    tocItem.className = `toc-${heading.tagName.toLowerCase()}`;

    // 创建目录链接
    const tocLink = document.createElement("a");
    tocLink.href = `#${heading.id}`;
    tocLink.textContent = heading.textContent;

    // 添加点击事件，平滑滚动到对应标题
    tocLink.addEventListener("click", function (e) {
      e.preventDefault();

      // [修复] 使用 getElementById 替代 querySelector 以支持数字开头的 ID
      const targetElement = document.getElementById(heading.id);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }

      // 更新活动目录项
      updateActiveTocItem(heading.id);
    });

    // 将链接添加到目录项
    tocItem.appendChild(tocLink);

    // 将目录项添加到目录列表
    tocList.appendChild(tocItem);
  });

  // 将目录列表添加到目录容器
  tocContainer.appendChild(tocList);

  // 初始化活动目录项
  updateActiveTocItem();

  // 监听滚动事件，更新活动目录项
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveTocItem();
        ticking = false;
      });
      ticking = true;
    }
  });

  /**
   * 更新活动目录项
   * @param {string} activeId - 活动标题的ID
   */
  function updateActiveTocItem(activeId) {
    // 获取所有标题元素的位置信息
    const headingPositions = Array.from(headings).map((heading) => {
      const rect = heading.getBoundingClientRect();
      return {
        id: heading.id,
        top: rect.top + window.pageYOffset,
      };
    });

    // 获取当前滚动位置
    const scrollPosition = window.pageYOffset + 100; // 添加一些偏移量

    // 找到当前滚动位置对应的标题
    let currentHeading = null;

    for (let i = headingPositions.length - 1; i >= 0; i--) {
      if (scrollPosition >= headingPositions[i].top) {
        currentHeading = headingPositions[i].id;
        break;
      }
    }

    // 如果指定了活动ID，则使用指定的ID
    if (activeId) {
      currentHeading = activeId;
    }

    // 移除所有目录项的活动状态
    const tocLinks = tocContainer.querySelectorAll("a");
    tocLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // 为当前标题对应的目录项添加活动状态
    if (currentHeading) {
      // querySelector在这里仍然用于查找 a 标签，href 属性值需要转义，但这里是查找 a[href="..."]
      // 只要 href 的值正确引用即可。为了保险，我们使用 CSS.escape (如果浏览器支持) 或者 try-catch
      // 但实际上对于 href 属性选择器，只要引号包裹，通常能处理大部分情况。
      // 最稳妥的方式是直接转义 ID 用于 CSS 选择器
      try {
        // CSS.escape 是现代浏览器标准，如果不支持可能需要 polyfill，但通常可以直接用
        // 如果 ID 包含特殊字符，直接拼接到选择器可能会有问题
        // 既然前面我们只改了 scrollIntoView 的逻辑，这里保持原样通常没问题，
        // 因为 href 属性值只是字符串匹配。
        const activeLink = tocContainer.querySelector(
          `a[href="#${currentHeading}"]`,
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      } catch (e) {
        // 如果选择器报错（极少见情况），忽略
        console.warn("TOC active link update failed for ID:", currentHeading);
      }
    }
  }

  // 创建移动端目录按钮和面板
  createMobileToc();

  /**
   * 创建移动端目录按钮和面板
   */
  function createMobileToc() {
    // 获取或创建按钮容器
    const buttonContainer =
      document.querySelector(".button-container") ||
      (function () {
        const container = document.createElement("div");
        container.className = "button-container";
        container.style.cssText = `
        position: fixed;
        right: 20px;
        bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
      `;
        document.body.appendChild(container);
        return container;
      })();

    // 创建移动端目录按钮
    const mobileTocToggle = document.createElement("div");
    mobileTocToggle.className = "mobile-toc-toggle";
    mobileTocToggle.innerHTML = '<i class="fas fa-list"></i>';

    // 创建移动端目录面板
    const mobileTocPanel = document.createElement("div");
    mobileTocPanel.className = "mobile-toc-panel";

    // 创建移动端目录标题
    const mobileTocTitle = document.createElement("div");
    mobileTocTitle.className = "toc-title";
    mobileTocTitle.textContent = "目录";

    // 创建移动端目录内容
    const mobileTocContent = document.createElement("div");
    mobileTocContent.className = "toc-content";
    mobileTocContent.appendChild(tocList.cloneNode(true));

    // 创建关闭按钮
    const closeButton = document.createElement("button");
    closeButton.className = "mobile-toc-close";
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "1.5rem";
    closeButton.style.cursor = "pointer";

    // 创建遮罩层
    const mobileTocOverlay = document.createElement("div");
    mobileTocOverlay.className = "mobile-toc-overlay";

    // 组装移动端目录面板
    mobileTocPanel.appendChild(mobileTocTitle);
    mobileTocPanel.appendChild(mobileTocContent);
    mobileTocPanel.appendChild(closeButton);

    // 添加到页面
    buttonContainer.appendChild(mobileTocToggle);
    document.body.appendChild(mobileTocPanel);
    document.body.appendChild(mobileTocOverlay);

    // 添加点击事件
    mobileTocToggle.addEventListener("click", function () {
      mobileTocPanel.classList.add("active");
      mobileTocOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    closeButton.addEventListener("click", closeMobileToc);
    mobileTocOverlay.addEventListener("click", closeMobileToc);

    // 为移动端目录链接添加点击事件
    const mobileTocLinks = mobileTocContent.querySelectorAll("a");
    mobileTocLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();

        // 获取目标ID
        const targetId = this.getAttribute("href").substring(1);

        // [修复] 使用 getElementById 替代 querySelector 以支持数字开头的 ID
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // 滚动到对应标题
          targetElement.scrollIntoView({
            behavior: "smooth",
          });

          // 更新活动目录项
          updateActiveTocItem(targetId);
        }

        // 关闭移动端目录
        closeMobileToc();
      });
    });

    /**
     * 关闭移动端目录
     */
    function closeMobileToc() {
      mobileTocPanel.classList.remove("active");
      mobileTocOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});
