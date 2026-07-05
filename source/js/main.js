// Newspaper Theme - Main JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initTypingEffect();
  initSmoothScroll();
  initMobileMenu();
  initArticleFilter();
  initLoadMore();
  initPostShare();
  initScrollAnimations();
  initLazyLoading();
  initBackToTop();
  initGoToComments();
  initCodeBlockFolding();
  initAuthorCardAnimation();
  initCodeBlockScroll();
});

// ===== Typing Effect =====
function initTypingEffect() {
  const typingElement = document.getElementById("typing-text");
  if (!typingElement) return;

  // Get typing text from theme config or use default
  const typingText =
    typingElement.getAttribute("data-text") || "Welcome to my blog";
  const typingSpeed = parseInt(typingElement.getAttribute("data-speed")) || 100;
  const deleteSpeed =
    parseInt(typingElement.getAttribute("data-delete-speed")) || 50;
  const pauseDuration =
    parseInt(typingElement.getAttribute("data-pause")) || 2000;
  const shouldLoop = typingElement.getAttribute("data-loop") === "true";

  let i = 0;
  let isDeleting = false;
  let isPaused = false;

  function typeWriter() {
    if (isPaused) {
      setTimeout(typeWriter, pauseDuration);
      isPaused = false;
      return;
    }

    if (!isDeleting) {
      typingElement.textContent = typingText.substring(0, i + 1);
      i++;

      if (i === typingText.length) {
        isPaused = true;
        setTimeout(() => {
          if (shouldLoop) {
            isDeleting = true;
            typeWriter();
          }
        }, pauseDuration);
        return;
      }
    } else {
      typingElement.textContent = typingText.substring(0, i - 1);
      i--;

      if (i === 0) {
        isDeleting = false;
        isPaused = true;
        setTimeout(() => {
          if (shouldLoop) {
            typeWriter();
          }
        }, pauseDuration / 2);
        return;
      }
    }

    const speed = isDeleting ? deleteSpeed : typingSpeed;
    setTimeout(typeWriter, speed);
  }

  typeWriter();
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  // Smooth scroll for hero section
  const heroScroll = document.querySelector(".hero-scroll");
  if (heroScroll) {
    heroScroll.addEventListener("click", function () {
      const articlesSection = document.querySelector(".articles-section");
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// ===== Mobile Menu =====
function initMobileMenu() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  // Close menu when clicking on a link
  navMenu.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", function () {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
    }
  });
}

// ===== Article Filter =====
function initArticleFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const articleCards = document.querySelectorAll(".article-card");

  if (filterButtons.length === 0 || articleCards.length === 0) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");

      articleCards.forEach((card) => {
        if (filter === "all") {
          card.style.display = "block";
          setTimeout(() => card.classList.add("fade-in"), 10);
        } else {
          const category = card.querySelector(".article-category");
          if (category && category.textContent.trim() === filter) {
            card.style.display = "block";
            setTimeout(() => card.classList.add("fade-in"), 10);
          } else {
            card.style.display = "none";
            card.classList.remove("fade-in");
          }
        }
      });
    });
  });
}

// ===== Load More Articles =====
function initLoadMore() {
  const loadMoreBtn = document.querySelector(".load-more-btn");
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener("click", function () {
    // Simulate loading more articles
    this.innerHTML = '<span class="loading"></span> 加载中...';
    this.disabled = true;

    // Simulate API call
    setTimeout(() => {
      // In a real implementation, this would fetch new articles
      // For now, we'll just show a message
      this.innerHTML = "没有了哦~";
      this.style.opacity = "0.6";

      // You would typically append new articles to the grid here
    }, 1500);
  });
}

// ===== Post Share =====
function initPostShare() {
  const shareButtons = document.querySelectorAll(".share-btn");
  const copyButton = document.querySelector(".share-btn.copy");

  shareButtons.forEach((button) => {
    if (button === copyButton) return;

    button.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.getAttribute("href");
      window.open(url, "_blank", "width=600,height=400");
    });
  });

  if (copyButton) {
    copyButton.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.getAttribute("data-copy");

      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showNotification("链接已复制到剪切板!");
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showNotification("链接已复制到剪切板!");
      }
    });
  }
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe article cards and other elements
  document
    .querySelectorAll(".article-card, .category-card, .archive-post")
    .forEach((el) => {
      observer.observe(el);
    });
}

// ===== Lazy Loading =====
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach((img) => {
      img.src = img.dataset.src || img.src;
    });
  }
}

// ===== Button Container =====
function initButtonContainer() {
  // 创建按钮容器
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 1000;
  `;

  document.body.appendChild(buttonContainer);
  return buttonContainer;
}

// ===== Back to Top =====
function initBackToTop() {
  const buttonContainer =
    document.querySelector(".button-container") || initButtonContainer();

  const backToTopBtn = document.createElement("button");
  backToTopBtn.className = "back-to-top";
  backToTopBtn.innerHTML = "↑";
  backToTopBtn.style.cssText = `
    width: 50px;
    height: 50px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  buttonContainer.appendChild(backToTopBtn);

  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.opacity = "1";
      backToTopBtn.style.visibility = "visible";
    } else {
      backToTopBtn.style.opacity = "0";
      backToTopBtn.style.visibility = "hidden";
    }
  });

  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ===== Notification System =====
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#4CAF50" : "#f44336"};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ===== Header Scroll Effect =====
function initHeaderScroll() {
  const header = document.querySelector(".header");
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.style.background = "rgba(255, 255, 255, 0.98)";
      header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)";
      header.style.boxShadow = "none";
    }

    lastScroll = currentScroll;
  });
}

// ===== Parallax Effect =====
function initParallax() {
  const heroBackground = document.querySelector(".hero-background img");
  if (!heroBackground) return;

  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * 0.5;
    heroBackground.style.transform = `translateY(${parallax}px)`;
  });
}

// ===== Form Validation =====
function initFormValidation() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;
      const requiredFields = form.querySelectorAll("[required]");

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          field.classList.add("error");
          isValid = false;
        } else {
          field.classList.remove("error");
        }
      });

      if (isValid) {
        showNotification("Form submitted successfully!");
        form.reset();
      } else {
        showNotification("Please fill in all required fields.", "error");
      }
    });
  });
}

// ===== Go to Comments =====
function initGoToComments() {
  // 只在文章页面显示评论按钮
  if (!document.querySelector(".post-content")) return;

  // 只在有评论区域时显示按钮
  if (!document.querySelector(".comments-section")) return;

  const buttonContainer =
    document.querySelector(".button-container") || initButtonContainer();

  const goToCommentsBtn = document.createElement("button");
  goToCommentsBtn.className = "go-to-comments";
  goToCommentsBtn.innerHTML = "💬";
  goToCommentsBtn.style.cssText = `
    width: 50px;
    height: 50px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  buttonContainer.appendChild(goToCommentsBtn);

  // 滚动时显示/隐藏按钮
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      goToCommentsBtn.style.opacity = "1";
      goToCommentsBtn.style.visibility = "visible";
    } else {
      goToCommentsBtn.style.opacity = "0";
      goToCommentsBtn.style.visibility = "hidden";
    }
  });

  // 点击按钮滚动到评论区
  goToCommentsBtn.addEventListener("click", function () {
    const commentsSection = document.querySelector(".comments-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// ===== Dark Mode Toggle =====
function initDarkMode() {
  const buttonContainer =
    document.querySelector(".button-container") || initButtonContainer();

  const darkModeToggle = document.createElement("button");
  darkModeToggle.className = "dark-mode-toggle";
  darkModeToggle.innerHTML = "🌙";
  darkModeToggle.style.cssText = `
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  buttonContainer.appendChild(darkModeToggle);

  darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    this.innerHTML = document.body.classList.contains("dark-mode")
      ? "☀️"
      : "🌙";

    // Save preference
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark-mode"),
    );
  });

  // Load saved preference
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  if (savedDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.innerHTML = "☀️";
  }
}

// ===== Initialize additional features =====
document.addEventListener("DOMContentLoaded", function () {
  initHeaderScroll();
  initParallax();
  initFormValidation();

  // Only initialize dark mode if enabled in theme config
  if (
    window.theme &&
    window.theme.features &&
    window.theme.features.dark_mode
  ) {
    initDarkMode();
  }
});

// ===== Code Block Folding =====
function initCodeBlockFolding() {
  // Check if code folding is enabled in theme config
  if (
    !window.theme ||
    !window.theme.code_block ||
    !window.theme.code_block.enable_folding
  ) {
    return;
  }

  // Parse max_height value, handle both "300px" and 300 formats
  let maxHeight = window.theme.code_block.max_height || 300;
  if (typeof maxHeight === "string") {
    maxHeight = parseInt(maxHeight.replace("px", ""));
  }

  // Set CSS variable for max height
  document.documentElement.style.setProperty(
    "--code-max-height",
    `${maxHeight}px`,
  );

  // Find all code blocks in post content, also try alternative selectors
  let codeBlocks = document.querySelectorAll(".post-content pre");
  if (codeBlocks.length === 0) {
    codeBlocks = document.querySelectorAll("pre");
  }

  codeBlocks.forEach((block) => {
    // Check if code block height exceeds max height
    if (block.offsetHeight > maxHeight) {
      // Create wrapper div
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper collapsed";

      // Insert wrapper before the code block
      block.parentNode.insertBefore(wrapper, block);

      // Move code block inside wrapper
      wrapper.appendChild(block);

      // Create toggle button
      const toggleButton = document.createElement("button");
      toggleButton.className = "code-toggle";
      // ★★★ 1. 设置初始文字属性 (中文) ★★★
      toggleButton.setAttribute("data-text", "展开代码");

      // Add toggle button to wrapper
      wrapper.appendChild(toggleButton);

      // Add click event to toggle button
      toggleButton.addEventListener("click", function (e) {
        e.preventDefault();
        wrapper.classList.toggle("collapsed");
        wrapper.classList.toggle("expanded");

        // ★★★ 2. 动态切换并翻译 ★★★
        // 获取翻译函数 (如果已经有 window.i18n)
        const t = (text) =>
          window.i18n && window.i18n.get ? window.i18n.get(text) : text;

        if (wrapper.classList.contains("expanded")) {
          toggleButton.setAttribute("data-text", t("折叠代码"));
        } else {
          toggleButton.setAttribute("data-text", t("展开代码"));
        }
      });
    }
  });
}

// ===== Author Card Background Animation =====
function initAuthorCardAnimation() {
  // 获取所有带有交互背景的作者卡片
  const interactiveCards = document.querySelectorAll(
    ".author-card-bg--interactive",
  );

  if (interactiveCards.length > 0) {
    interactiveCards.forEach((card) => {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
      });

      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--mouse-x", `50%`);
        card.style.setProperty("--mouse-y", `50%`);
      });
    });
  }

  // 自动适应主题颜色
  const autoColorCards = document.querySelectorAll(".author-card-bg--auto");
  if (autoColorCards.length > 0) {
    const checkDarkMode = () => {
      const isDarkMode =
        document.body.classList.contains("dark-mode") ||
        (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      autoColorCards.forEach((card) => {
        if (isDarkMode) {
          card.classList.add("author-card-bg--dark");
          card.classList.remove("author-card-bg--light");
        } else {
          card.classList.add("author-card-bg--light");
          card.classList.remove("author-card-bg--dark");
        }
      });
    };

    // 初始检查
    checkDarkMode();

    // 监听主题变化
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", checkDarkMode);
    }

    // 监听手动切换主题的事件
    document.addEventListener("themeChange", checkDarkMode);
  }
}

// ===== Export functions for external use =====
window.newspaperTheme = {
  showNotification: showNotification,
  initTypingEffect: initTypingEffect,
  initSmoothScroll: initSmoothScroll,
  initCodeBlockFolding: initCodeBlockFolding,
  initAuthorCardAnimation: initAuthorCardAnimation,
};

// ===== Code Block Horizontal Scroll (鼠标滚轮横向滚动代码) =====
function initCodeBlockScroll() {
  // 获取所有可能产生横向滚动的代码区域（兼容 Hexo 表格高亮和普通 pre 高亮）
  const codeBlocks = document.querySelectorAll(
    "figure.highlight .code pre, .post-content pre",
  );

  codeBlocks.forEach((block) => {
    block.addEventListener(
      "wheel",
      function (e) {
        // 如果按住了 Shift 键，系统默认就会横向滚动，不干预
        if (e.shiftKey) return;

        // 如果用户使用的是触摸板本身的横向滑动，不干预
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

        // 检查当前代码块是否真的有横向超出范围的内���
        const isScrollable = this.scrollWidth > this.clientWidth;
        if (!isScrollable) return;

        // 计算是否已经滚到了最左边缘或最右边缘
        const atLeftEdge = this.scrollLeft <= 0;
        // 容错处理：向上取整解决缩放导致的小数点像素误差
        const atRightEdge =
          Math.ceil(this.scrollLeft + this.clientWidth) >= this.scrollWidth;

        // e.deltaY > 0 表示滚轮向下滚 -> 映射为向右滚动代码
        if (e.deltaY > 0 && !atRightEdge) {
          e.preventDefault(); // 阻止页面整体向下滚动
          this.scrollLeft += e.deltaY;
        }
        // e.deltaY < 0 表示滚轮向上滚 -> 映射为向左滚动代码
        else if (e.deltaY < 0 && !atLeftEdge) {
          e.preventDefault(); // 阻止页面整体向上滚动
          this.scrollLeft += e.deltaY;
        }
      },
      { passive: false },
    ); // 必须设置为 false 才能使用 e.preventDefault()
  });
}
