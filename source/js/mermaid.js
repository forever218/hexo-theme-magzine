/**
 * mermaid.js
 *
 * Works with hexo-filter-mermaid-diagrams, which emits:
 *   <pre class="mermaid">diagram source text</pre>
 *
 * Self-contained fullscreen pan/zoom viewer — no external dependency.
 */

(function () {
  "use strict";

  var COLLAPSE_HEIGHT = 360;
  var MERMAID_CDN =
    "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js";

  var ICON_FULLSCREEN =
    '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';

  var ICON_COPY =
    '<svg viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

  var ICON_ZOOM_IN =
    '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/></svg>';

  var ICON_ZOOM_OUT =
    '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>';

  var ICON_ZOOM_RESET =
    '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';

  var ICON_ROTATE =
    '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';

  var ICON_LOCK =
    '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';

  /* ------------------------------------------------------------------
     Load external script once
     ------------------------------------------------------------------ */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function isDark() {
    return document.body.classList.contains("dark-mode");
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  /* Use mermaid's built-in colour themes so node fills stay colourful.
     Only override the accent/primary to match the site's accent colour,
     and nudge backgrounds to match the card. */
  function getMermaidConfig() {
    var dark = isDark();
    var accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim() || "#ff6b6b";

    return {
      startOnLoad: false,
      theme: dark ? "dark" : "default",
      themeVariables: {
        fontFamily: '"IBM Plex Mono","Fira Code",monospace',
        primaryColor: dark ? "#2d3748" : "#fff4dd",
        primaryBorderColor: dark ? "#4a5568" : "#aaaaaa",
        primaryTextColor: dark ? "#e2e8f0" : "#333333",
        lineColor: dark ? "#718096" : "#777777",
        critBkgColor: accent,
        critBorderColor: accent,
        todayLineColor: accent,
        activeTaskBkgColor: accent,
        activeTaskBorderColor: accent,
        background: dark ? "#212121" : "#f5f5f5",
        edgeLabelBackground: dark ? "#2d2d2d" : "#f0f0f0",
      },
      securityLevel: "loose",
    };
  }

  /* ------------------------------------------------------------------
     Find mermaid source blocks
     ------------------------------------------------------------------ */
  function findMermaidPres() {
    var els = Array.from(
      document.querySelectorAll(".post-content pre.mermaid"),
    );
    if (els.length === 0) {
      els = Array.from(document.querySelectorAll("pre.mermaid"));
    }
    return els;
  }

  /* ------------------------------------------------------------------
     Self-contained fullscreen viewer
     ------------------------------------------------------------------ */
  var viewer = null;

  function getViewer() {
    if (viewer) return viewer;

    var overlay = document.createElement("div");
    overlay.className = "mermaid-viewer";

    // Mobile uses a flex-centering container (like image-zoom's
    // .image-viewer-container) so CSS handles fit-to-screen naturally.
    var container = document.createElement("div");
    container.className = "mermaid-viewer-container";

    var stage = document.createElement("div");
    stage.className = "mermaid-viewer-stage";

    var closeBtn = document.createElement("div");
    closeBtn.className = "mermaid-viewer-close";
    closeBtn.innerHTML = "&times;";

    var toolbar = document.createElement("div");
    toolbar.className = "mermaid-viewer-toolbar";

    container.appendChild(stage);
    overlay.appendChild(container);
    overlay.appendChild(closeBtn);
    overlay.appendChild(toolbar);
    document.body.appendChild(overlay);

    // Pan/zoom/rotate/lock state
    var scale = 1;
    var tx = 0;
    var ty = 0;
    var rotation = 0;
    var isLocked = false;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var lastTouchX = 0;
    var lastTouchY = 0;
    var startDist = 0;
    var startScale = 1;

    // The overlay is a flex container on both desktop and mobile, so the
    // stage is always CSS-centered. The transform is purely the pan/zoom
    // offset from that center — no translate(-50%,-50%) needed on either path.
    function updateTransform(animate) {
      stage.style.transition = animate
        ? "transform 0.3s cubic-bezier(0.25,0.8,0.25,1)"
        : "none";
      stage.style.transform =
        "translate(" +
        tx +
        "px," +
        ty +
        "px) rotate(" +
        rotation +
        "deg) scale(" +
        scale +
        ")";
    }

    function resetTransform(animate) {
      scale = 1;
      tx = 0;
      ty = 0;
      rotation = 0;
      updateTransform(animate !== false);
    }

    // Keep a reference to the mobile lock button so orientationchange can
    // read its state and resetTransform can clear the active class.
    var mobileLockBtn = null;

    function open(svgEl, source, onToolbar) {
      stage.innerHTML = "";
      resetTransform(false);

      if (svgEl) {
        var clone = svgEl.cloneNode(true);

        // Fix fullscreen colour loss: mermaid's internal styles depend on
        // the SVG's ID, so give the clone a unique suffixed ID and patch
        // the style tags to match.
        if (clone.id) {
          var oldId = clone.id;
          var newId = oldId + "-fullscreen";
          clone.id = newId;
          clone.querySelectorAll("style").forEach(function (styleTag) {
            styleTag.textContent = styleTag.textContent
              .split(oldId)
              .join(newId);
          });
        } else {
          clone.removeAttribute("id");
        }

        clone.removeAttribute("style");
        clone.setAttribute("overflow", "visible");

        if (isMobile()) {
          // On mobile, CSS constrains the SVG via max-width/max-height on the
          // stage (see .mermaid-viewer-stage in the mobile media query).
          // Remove any hard-coded pixel dimensions so CSS takes over.
          clone.removeAttribute("width");
          clone.removeAttribute("height");
          clone.style.cssText = "display:block;width:100%;height:auto;";
        } else {
          // Desktop: compute a pixel size from the viewBox so transform:scale()
          // handles all zooming without triggering layout.
          var vb = clone.getAttribute("viewBox");
          var vbParts = vb ? vb.trim().split(/[\s,]+/) : [];
          var vbW = vbParts.length === 4 ? parseFloat(vbParts[2]) : 0;
          var vbH = vbParts.length === 4 ? parseFloat(vbParts[3]) : 0;
          var maxW = window.innerWidth * 0.88;
          var maxH = window.innerHeight * 0.72;

          if (vbW > 0 && vbH > 0) {
            var ratio = Math.min(1, maxW / vbW, maxH / vbH);
            clone.setAttribute("width", Math.round(vbW * ratio));
            clone.setAttribute("height", Math.round(vbH * ratio));
          } else {
            clone.style.cssText =
              "display:block;max-width:" +
              maxW +
              "px;max-height:" +
              maxH +
              "px;width:auto;height:auto;";
          }
        }

        stage.appendChild(clone);
      }

      // ── Build toolbar ──────────────────────────────────────────────
      toolbar.innerHTML = "";
      mobileLockBtn = null;

      if (isMobile()) {
        // Mobile toolbar: Copy · Lock · Rotate  (image-zoom style)
        var mobileCopyBtn = document.createElement("button");
        mobileCopyBtn.className = "mermaid-viewer-btn";
        mobileCopyBtn.setAttribute("data-title", "复制源码");
        mobileCopyBtn.innerHTML = ICON_COPY;
        mobileCopyBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          function flash() {
            mobileCopyBtn.setAttribute("data-title", "已复制 ✓");
            setTimeout(function () {
              mobileCopyBtn.setAttribute("data-title", "复制源码");
            }, 1800);
          }
          if (navigator.clipboard) {
            navigator.clipboard.writeText(source).then(flash);
          } else {
            var ta = document.createElement("textarea");
            ta.value = source;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            flash();
          }
        });

        mobileLockBtn = document.createElement("button");
        mobileLockBtn.className = "mermaid-viewer-btn lock-btn";
        mobileLockBtn.setAttribute("data-title", "锁定方向");
        mobileLockBtn.innerHTML = ICON_LOCK;
        mobileLockBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          isLocked = !isLocked;
          mobileLockBtn.classList.toggle("active", isLocked);
        });

        var mobileRotateBtn = document.createElement("button");
        mobileRotateBtn.className = "mermaid-viewer-btn rotate-btn";
        mobileRotateBtn.setAttribute("data-title", "旋转90°");
        mobileRotateBtn.innerHTML = ICON_ROTATE;
        mobileRotateBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          rotation += 90;
          updateTransform(true);
        });

        toolbar.appendChild(mobileCopyBtn);
        toolbar.appendChild(mobileLockBtn);
        toolbar.appendChild(mobileRotateBtn);
      } else {
        // Desktop toolbar: Copy (from onToolbar callback) · Zoom In · Zoom Out · Reset
        if (typeof onToolbar === "function") {
          onToolbar(toolbar);
        }

        if (toolbar.children.length > 0) {
          var div = document.createElement("div");
          div.className = "mermaid-viewer-toolbar-divider";
          toolbar.appendChild(div);
        }

        var btnIn = document.createElement("button");
        btnIn.className = "mermaid-viewer-btn";
        btnIn.setAttribute("data-title", "放大");
        btnIn.innerHTML = ICON_ZOOM_IN;
        btnIn.addEventListener("click", function (e) {
          e.stopPropagation();
          scale = Math.min(scale * 1.25, 10);
          updateTransform(true);
        });

        var btnOut = document.createElement("button");
        btnOut.className = "mermaid-viewer-btn";
        btnOut.setAttribute("data-title", "缩小");
        btnOut.innerHTML = ICON_ZOOM_OUT;
        btnOut.addEventListener("click", function (e) {
          e.stopPropagation();
          scale = Math.max(scale / 1.25, 0.1);
          updateTransform(true);
        });

        var btnReset = document.createElement("button");
        btnReset.className = "mermaid-viewer-btn";
        btnReset.setAttribute("data-title", "重置");
        btnReset.innerHTML = ICON_ZOOM_RESET;
        btnReset.addEventListener("click", function (e) {
          e.stopPropagation();
          resetTransform(true);
        });

        toolbar.appendChild(btnIn);
        toolbar.appendChild(btnOut);
        toolbar.appendChild(btnReset);
      }

      if (isMobile()) {
        // Animate in: start slightly scaled down, pop to natural size — just
        // like image-zoom's viewImage which starts opacity:0.5 then fades up.
        stage.style.transition = "none";
        stage.style.opacity = "0.5";
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        void stage.offsetWidth; // force reflow
        stage.style.transition = "opacity 0.15s ease";
        stage.style.opacity = "1";
      } else {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }

    function close() {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      isLocked = false;
      if (mobileLockBtn) mobileLockBtn.classList.remove("active");
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target === container) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("active")) return;
      if (e.key === "Escape") close();
    });

    // Orientation change: reset unless locked (mirrors image-zoom)
    window.addEventListener("orientationchange", function () {
      if (!overlay.classList.contains("active")) return;
      if (isLocked) return;
      setTimeout(function () {
        resetTransform(true);
      }, 300);
    });

    overlay.addEventListener(
      "wheel",
      function (e) {
        if (!overlay.classList.contains("active")) return;
        e.preventDefault();
        var delta = e.deltaY < 0 ? 1.1 : 0.9;
        scale = Math.min(Math.max(0.1, scale * delta), 10);
        updateTransform(false);
      },
      { passive: false },
    );

    stage.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX - tx;
      startY = e.clientY - ty;
      stage.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
      tx = e.clientX - startX;
      ty = e.clientY - startY;
      updateTransform(false);
    });

    document.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        stage.style.cursor = "grab";
      }
    });

    // Touch listeners on overlay so panning works even when the finger
    // starts on the dark background outside the stage.
    overlay.addEventListener(
      "touchstart",
      function (e) {
        if (e.target.closest(".mermaid-viewer-toolbar, .mermaid-viewer-close"))
          return;
        if (e.touches.length === 1) {
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          startDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          );
          startScale = scale;
        }
      },
      { passive: false },
    );

    overlay.addEventListener(
      "touchmove",
      function (e) {
        if (e.target.closest(".mermaid-viewer-toolbar, .mermaid-viewer-close"))
          return;
        e.preventDefault();
        if (e.touches.length === 1) {
          tx += e.touches[0].clientX - lastTouchX;
          ty += e.touches[0].clientY - lastTouchY;
          lastTouchX = e.touches[0].clientX;
          lastTouchY = e.touches[0].clientY;
          updateTransform(false);
        } else if (e.touches.length === 2) {
          var newDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          );
          if (newDist > 0 && startDist > 0) {
            scale = Math.min(
              Math.max(0.1, startScale * (newDist / startDist)),
              10,
            );
            updateTransform(false);
          }
        }
      },
      { passive: false },
    );

    viewer = { open: open, close: close };
    return viewer;
  }

  /* ------------------------------------------------------------------
     Open viewer for a given block
     ------------------------------------------------------------------ */
  function openInViewer(source, svgSourceEl) {
    var v = getViewer();
    v.open(svgSourceEl, source, function (toolbar) {
      // Desktop-only copy button (mobile has its own in the unified toolbar)
      var copyBtn = document.createElement("button");
      copyBtn.className = "mermaid-viewer-btn";
      copyBtn.setAttribute("data-title", "复制源码");
      copyBtn.innerHTML = ICON_COPY;

      var copyNotice = document.createElement("span");
      copyNotice.className = "mermaid-viewer-copy-notice";
      copyNotice.textContent = "已复制";

      copyBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        function flash() {
          copyNotice.style.opacity = "1";
          copyBtn.setAttribute("data-title", "已复制 ✓");
          setTimeout(function () {
            copyNotice.style.opacity = "0";
            copyBtn.setAttribute("data-title", "复制源码");
          }, 1800);
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(source).then(flash);
        } else {
          var ta = document.createElement("textarea");
          ta.value = source;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          flash();
        }
      });

      toolbar.appendChild(copyBtn);
      toolbar.appendChild(copyNotice);
    });
  }

  /* ------------------------------------------------------------------
     Render all mermaid blocks
     ------------------------------------------------------------------ */
  function renderAll() {
    var pres = findMermaidPres();
    if (pres.length === 0) return;

    pres.forEach(function (pre, index) {
      var source = pre.textContent.trim();
      if (!source) return;

      var wrapper = document.createElement("div");
      wrapper.className = "mermaid-wrapper";
      wrapper.dataset.mermaidSource = source;

      var block = document.createElement("div");
      block.className = "mermaid-block";
      block.id = "mermaid-block-" + index;

      var fsBtn = document.createElement("button");
      fsBtn.className = "mermaid-fullscreen-btn";
      fsBtn.setAttribute("aria-label", "全屏查看");
      fsBtn.innerHTML = ICON_FULLSCREEN;
      fsBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openInViewer(source, block.querySelector("svg"));
      });

      wrapper.appendChild(block);
      wrapper.appendChild(fsBtn);

      pre.parentNode.insertBefore(wrapper, pre);
      pre.remove();

      window.mermaid
        .render("mermaid-svg-" + index, source)
        .then(function (result) {
          var tmp = document.createElement("div");
          tmp.innerHTML = result.svg;
          var svgEl = tmp.querySelector("svg");
          if (svgEl) {
            block.appendChild(svgEl);
          } else {
            block.insertAdjacentHTML("beforeend", result.svg);
          }
          applyCollapsible(wrapper, block);
        })
        .catch(function (err) {
          console.error(
            "[mermaid.js] render error for block " + index + ":",
            err,
          );
          var msg = document.createElement("pre");
          msg.style.cssText =
            "color:var(--accent-color,#ff6b6b);font-size:12px;white-space:pre-wrap;padding:12px;";
          msg.textContent = "[Mermaid Error]\n" + (err.message || String(err));
          block.appendChild(msg);
        });
    });
  }

  /* ------------------------------------------------------------------
     Collapsible — mirrors initCodeBlockFolding in main.js
     ------------------------------------------------------------------ */
  function applyCollapsible(wrapper, block) {
    var svgEl = block.querySelector("svg");
    if (!svgEl) return;

    var h =
      svgEl.getBoundingClientRect().height ||
      (svgEl.viewBox && svgEl.viewBox.baseVal
        ? svgEl.viewBox.baseVal.height
        : 0);

    if (h <= COLLAPSE_HEIGHT) return;

    wrapper.classList.add("collapsed");

    var btn = document.createElement("button");
    btn.className = "mermaid-toggle";
    btn.setAttribute("data-text", "展开图表");

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isCollapsed = wrapper.classList.contains("collapsed");
      wrapper.classList.toggle("collapsed", !isCollapsed);
      wrapper.classList.toggle("expanded", isCollapsed);
      var t = function (s) {
        return window.i18n && window.i18n.get ? window.i18n.get(s) : s;
      };
      btn.setAttribute(
        "data-text",
        isCollapsed ? t("折叠图表") : t("展开图表"),
      );
    });

    wrapper.appendChild(btn);
  }

  /* ------------------------------------------------------------------
     Dark-mode re-render
     ------------------------------------------------------------------ */
  function watchDarkMode() {
    var observer = new MutationObserver(function () {
      window.mermaid.initialize(getMermaidConfig());

      document.querySelectorAll(".mermaid-wrapper").forEach(function (wrapper) {
        var source = wrapper.dataset.mermaidSource;
        var block = wrapper.querySelector(".mermaid-block");
        if (!source || !block) return;

        var uid =
          "mermaid-rerender-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2);

        window.mermaid
          .render(uid, source)
          .then(function (result) {
            var old = block.querySelector("svg, pre");
            if (old) old.remove();
            var tmp = document.createElement("div");
            tmp.innerHTML = result.svg;
            var svgEl = tmp.querySelector("svg");
            if (svgEl) block.appendChild(svgEl);
          })
          .catch(function () {});
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  /* ------------------------------------------------------------------
     Entry point
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var pres = findMermaidPres();
    if (pres.length === 0) return;

    loadScript(MERMAID_CDN)
      .then(function () {
        window.mermaid.initialize(getMermaidConfig());
        renderAll();
        watchDarkMode();
      })
      .catch(function (err) {
        console.error("[mermaid.js] Failed to load mermaid library:", err);
      });
  });
})();
