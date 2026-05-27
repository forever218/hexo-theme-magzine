/**
 * ============================================
 * 桌宠文字避让功能 (pet-pretext-interaction.js)
 * 进阶版：支持标题、列表、表格和代码高亮块，且不破坏HTML结构
 * 【已加入时间切片与性能保护】
 * ============================================
 */

export class PetPretextInteraction {
  constructor(options = {}) {
    this.repelRadius = options.repelRadius || 50;
    this.throttleMs = options.throttleMs || 50;
    this.lastRun = 0;

    this.iframe = null;
    this.activeBlocks = [];

    // 新增：标识是否正在分批处理DOM中，防止重复执行
    this.isPreparing = false;
  }

  // 核心黑科技：深度遍历文本节点，不破坏任何原有 HTML 结构
  wrapTextNodes(element, doc) {
    const spans = [];
    const walker = doc.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parentName = node.parentNode.nodeName;
          if (parentName === "SCRIPT" || parentName === "STYLE")
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false,
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      if (!text.trim()) return;

      const fragment = doc.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char.trim() === "") {
          fragment.appendChild(doc.createTextNode(char));
        } else {
          const span = doc.createElement("span");
          span.textContent = char;
          span.style.display = "inline-block";
          span.style.transition =
            "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)";
          span.style.position = "relative";
          fragment.appendChild(span);
          spans.push(span);
        }
      }
      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return spans;
  }

  prepareIframeText() {
    if (!this.iframe || !this.iframe.contentDocument) {
      this.isPreparing = false; // 退出时必须解锁
      return;
    }
    const doc = this.iframe.contentDocument;

    const articleBody = doc.querySelector(
      ".post-content, .article-content, .markdown-body, #article-container",
    );
    if (!articleBody) {
      this.isPreparing = false; // 退出时必须解锁
      return;
    }

    const blocks = articleBody.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, td:not(.gutter), th, pre",
    );

    if (blocks.length === 0) {
      this.isPreparing = false; // 退出时必须解锁
      return;
    }

    this.activeBlocks = [];
    let i = 0;

    const processChunk = () => {
      const maxTimePerFrame = 8;
      const startTime = performance.now();

      while (
        i < blocks.length &&
        performance.now() - startTime < maxTimePerFrame
      ) {
        const block = blocks[i];
        i++;

        if (block.closest("[data-pretext-ready]")) continue;

        if (block.textContent && block.textContent.length > 800) {
          block.setAttribute("data-pretext-ready", "ignored");
          continue;
        }

        const spans = this.wrapTextNodes(block, doc);
        if (spans.length > 0) {
          block.setAttribute("data-pretext-ready", "true");
          this.activeBlocks.push({
            el: block,
            spans: spans,
          });
        }
      }

      if (i < blocks.length) {
        requestAnimationFrame(processChunk);
      } else {
        // 全部处理完毕，真正解锁
        this.isPreparing = false;
      }
    };

    requestAnimationFrame(processChunk);
  }

  update(petScreenX, petScreenY, timestamp) {
    if (!this.iframe) {
      this.iframe = document.querySelector(".article-modal-iframe");
    }
    if (!this.iframe) return;

    if (timestamp - this.lastRun < this.throttleMs) return;
    this.lastRun = timestamp;

    const modal = document.querySelector(".article-modal");
    if (!modal || !modal.classList.contains("active")) return;

    const doc = this.iframe.contentDocument;
    if (!doc) return;

    // 判断切文章
    if (
      this.activeBlocks.length > 0 &&
      !doc.contains(this.activeBlocks[0].el)
    ) {
      this.activeBlocks = [];
      this.isPreparing = false;
    }

    // 【修复死锁的核心逻辑】
    if (this.activeBlocks.length === 0 && !this.isPreparing) {
      // 在上锁之前，先确保 iframe 已经完全加载完毕，否则直接 return 等待下一帧，不上锁
      if (doc.readyState !== "complete") return;

      this.isPreparing = true; // 上锁

      setTimeout(() => {
        if (this.iframe && this.iframe.contentDocument) {
          this.prepareIframeText();
        } else {
          this.isPreparing = false; // 没找到文档也得解锁
        }
      }, 800);
      return;
    }

    if (this.isPreparing) return;

    const iframeRect = this.iframe.getBoundingClientRect();

    if (
      petScreenX < iframeRect.left ||
      petScreenX > iframeRect.right ||
      petScreenY < iframeRect.top ||
      petScreenY > iframeRect.bottom
    ) {
      this.resetText();
      return;
    }

    const petIframeX = petScreenX - iframeRect.left;
    const petIframeY =
      petScreenY - iframeRect.top + doc.documentElement.scrollTop;

    this.activeBlocks.forEach((blockObj) => {
      const pRect = blockObj.el.getBoundingClientRect();
      const pTopAbsolute = pRect.top + doc.documentElement.scrollTop;
      const pBottomAbsolute = pRect.bottom + doc.documentElement.scrollTop;
      const margin = this.repelRadius + 100;

      if (
        petIframeY < pTopAbsolute - margin ||
        petIframeY > pBottomAbsolute + margin
      ) {
        blockObj.spans.forEach((span) => {
          if (
            span.style.transform !== "translate(0px, 0px)" &&
            span.style.transform !== ""
          ) {
            span.style.transform = "translate(0px, 0px)";
            span.style.zIndex = "1";
          }
        });
        return;
      }

      blockObj.spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const spanX = rect.left + rect.width / 2;
        const spanY =
          rect.top + doc.documentElement.scrollTop + rect.height / 2;

        const dx = spanX - petIframeX;
        const dy = spanY - petIframeY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.repelRadius) {
          const force = (this.repelRadius - distance) / this.repelRadius;
          const pushX = (dx / distance) * force * 15;
          const pushY = (dy / distance) * force * 15;

          span.style.transform = `translate(${pushX}px, ${pushY}px)`;
          span.style.zIndex = "10";
        } else if (
          span.style.transform !== "translate(0px, 0px)" &&
          span.style.transform !== ""
        ) {
          span.style.transform = "translate(0px, 0px)";
          span.style.zIndex = "1";
        }
      });
    });
  }

  resetText() {
    this.activeBlocks.forEach((blockObj) => {
      blockObj.spans.forEach((span) => {
        if (
          span.style.transform !== "translate(0px, 0px)" &&
          span.style.transform !== ""
        ) {
          span.style.transform = "translate(0px, 0px)";
          span.style.zIndex = "1";
        }
      });
    });
  }
}
