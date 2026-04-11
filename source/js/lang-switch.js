document.addEventListener("DOMContentLoaded", function () {
  // 1. 定义翻译字典
  const translations = {
    //大家请注意:左侧中文不能随意修改,需要和about.pug,about.yml,还有_config.yml等等里的字符串保持完全一致
    //大家不用担心这个会影响到文章内容,这个只是一些主题自带的固定文本的翻译,文章markdown内容是独立的完全不受影响,所以大家可以放心修改右侧的英文翻译结果😄😄

    //主界面(请在_config.yml里修改左侧内容后,再来这里修改左右侧的翻译内容,保持一一对应关系)
    然: "Ran",
    "人生而自由，却无往不在枷锁之中":
      "Man is born free, and everywhere he is in chains.",
    关于我: "About Me",
    未来的回忆: "Memories of the Future",
    首页: "Home",
    "© 2025 李思然. 保留所有权利.": "© 2025 Lisiran. All rights reserved.",

    // 关于(请在themes\magzine\layout\about.pug里修改左侧内容后,再来这里修改右侧的翻译内容,保持一一对应关系)
    暂无数据: "No Data",
    关于: "About",
    称呼: "Name",
    家乡: "Hometown",
    大学: "University",
    现居地: "Current Location",
    教育: "Education",
    身份: "Identity",
    广东广州: "Guangzhou, Guangdong",
    中北大学: "North University of China",
    山西太原: "Taiyuan, Shanxi",
    大四在读: "Senior Year Student",
    程序员: "Programmer",

    联系方式: "Contact",
    邮箱: "Email",
    哔哩哔哩: "Bilibili",
    凛冬亦夏: "Lindong Yixia",

    兴趣点: "Interests",
    摄影: "Photography",
    羽毛球: "Badminton",
    油画: "Oil Painting",
    设计: "Design",
    代码: "Coding",
    哲学: "Philosophy",
    生活: "Life",
    艺术: "Art",
    运动: "Sports",
    创造: "Creation",
    游戏: "Gaming",
    阅读: "Reading",
    骑行: "Cycling",
    爬山: "Hiking",
    长跑: "Running",
    旅行: "Traveling",

    自我介绍: "Self Introduction",

    //卡片文字(请在themes\magzine\source\_data\about.yml里修改左侧内容后,再来这里修改右侧的翻译内容,保持一一对应关系)
    "享受生活中的每一个瞬间，发现平凡中的美好":
      "Enjoy every moment of life and discover beauty in the ordinary",
    "探索美食、旅行、摄影，记录生活的点点滴滴":
      "Explore food, travel, and photography, and capture the little moments of life",

    "用艺术表达情感，用创意点亮生活":
      "Express emotions through art and brighten life with creativity",
    "绘画、设计、音乐，感受艺术的无限可能":
      "Painting, design, and music—experience the endless possibilities of art",

    "挥洒汗水，挑战自我，保持身心健康":
      "Push your limits, stay active, and maintain physical and mental well-being",
    "跑步、篮球、游泳，享受运动带来的活力":
      "Running, basketball, and swimming—enjoy the energy and vitality of sports",

    "将想法变为现实，用创造力改变世界":
      "Turn ideas into reality and change the world through creativity",
    "编程、写作、发明，用创造力构建未来":
      "Programming, writing, and inventing—build the future with creativity",

    "探索世界，发现未知的美好": "Explore the world and discover unknown beauty",
    "走过山川湖海，体验不同文化，收集旅途中的故事":
      "Journey through mountains, rivers, and seas, experience different cultures, and collect stories along the way",

    "在书海中遨游，与智者对话":
      "Dive into the ocean of books and converse with great minds",
    "文学、历史、科技，通过阅读拓展视野和思维":
      "Literature, history, and technology—expand your horizons and thinking through reading",

    // 归档(不要更改,blog预设内容)
    归档: "Archives",

    //其他(请在_config.yml里修改左侧内容后,再来这里修改右侧的翻译内容,保持一一对应关系)
    网站: "Site",
    示例网站: "Example Site",

    // 分类(不要更改,blog预设内容)
    分类: "Categories",
    所有分类: "All Categories",
    暂无分类: "No Categories",
    阅读全文: "Read More",
    开始为您的文章添加分类: "Start Adding Categories to Your Posts",
    返回首页: "Back to Home",
    共有: "Total",
    篇文章: "Posts",
    相关分类: "Category",
    返回所有分类: "Back to All Categories",

    // 标签(不要更改,blog预设内容)
    标签: "Tags",
    暂无标签: "No Tags",
    开始为您的文章添加标签: "Start Adding Tags to Your Posts",
    探索与: "Discover",
    相关的所有文章: "related posts",
    返回所有标签: "Back to All Tags",

    //不要更改(blog预设内容)
    友链: "Links",

    //友链内容(请在"themes\magzine\layout\link.pug里修改左侧内容后,再来这里修改右侧的翻译内容,保持一一对应关系)
    友情链接: "Friend Links",
    胡杨怕火: "Huyangpahuo",
    "传递笑容魔法的Ciallo～(∠・ω< )⌒☆":
      "Ciallo, the Smiling Magician~ (∠・ω< )⌒☆",

    "春江潮水连海平，海上明月共潮生":
      "The spring river tide merges seamlessly with the sea;Above the waves, the bright moon rises with the tide.",
    "暂无友链数据，请在 source/_data/link.yml 中添加友链信息":
      "No link data found. Please add entries to source/_data/link.yml",
    "天接云涛连晓雾, 星河欲转千帆舞。":
      "The sky meets rolling clouds and morning mist as one,The Milky Way turns, and a thousand sails dance.",

    添加友链: "Add Friend Link",
    "欢迎互换友链！您需要遵循以下规则：":
      "Friend link exchanges are welcome! Please follow the rules below:",
    "已在贵站添加我的友链，信息：":
      "You have already added your link to my site. My information is:",
    贵站没有违法内容:
      "Your site must not contain illegal or prohibited content.",
    "您可以使用以下模板在评论区申请：":
      "You may use the template below and leave a comment to apply:",
    "我会常去串门的😊~": "I'll drop by your site from time to time 😊~",

    // 评论区(不要更改,blog预设内容)
    评论区: "Comments",
    昵称: "Nickname",
    网址: "URL",
    必填: "Required",
    选填: "Optional",
    预览: "Preview",
    发送: "Submit",
    没有评论: "No Comments",
    Twikoo评论加载成功: "Twikoo comments loaded successfully",

    // 隐藏内容(不要更改,blog预设内容)
    点击查看隐藏内容: "Click to reveal hidden content",
    " (点击恢复)": " (Click to hide again)",

    // AI摘要(请在_config.yml里修改左侧内容后,再来这里修改右侧的翻译内容,保持一一对应关系)
    "然-AI": "Ran-AI",
    "我是文章辅助AI: 然-AI，一个基于deepseek的强大语言模型，有什么可以帮到您？😊":
      "Hello! I'm Ran-AI, your article assistant AI, a powerful language model based on DeepSeek.How can I assist you today? 😊",
    "Ran-AI请求AI出错了，请稍后再试。":
      "Ran-AI encountered an error while requesting AI. Please try again later.",

    //不要更改(blog预设内容)
    "生成中. . .": "Generating...",
    "请等待. . .": "Please wait...",
    介绍自己: "Introduce",
    来点灵感: "Inspiration",
    生成AI简介: "Generate Summary",

    // 文章(不要更改,blog预设内容)
    "点击阅读->": "Click to Read ->",
    目录: "Directory",
    无目录: "No Directory",
    "← 上一篇": "← Previous",
    "下一篇 →": "Next →",
    加载更多文章: "Load More Articles",
    " 加载中...": "Loading...",
    "没有了哦~": "No more articles~",
    加载文章失败: "Error loading articles",
    分钟: "min",
    字: "words",

    // 搜索(不要更改,blog预设内容)
    "搜索文章...": "Search Articles...",
    搜索索引未加载: "Search index not loaded",
    没有找到相关结果: "No results found",

    // 图片(不要更改,blog预设内容)
    上一张: "Previous",
    下一张: "Next",
    "旋转90°": "Rotate 90°",
    锁定方向: "Lock Orientation",
    保存图片: "Save Image",

    // 分享文章(不要更改,blog预设内容)
    分享这篇文章到: "Share this article",
    推特: "Twitter",
    脸书: "Facebook",
    领英: "LinkedIn",
    微信: "WeChat",
    微博: "Weibo",
    点击复制链接: "Copy Link",
    "已复制!": "Copied!",
    "链接已复制到剪切板!": "Link copied to clipboard!",
    微信扫一扫分享: "WeChat Scan to Share",
    '打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享至朋友圈。':
      "Open WeChat, tap 'Discover', use 'Scan' to share this page to Moments.",

    // 代码折叠(不要更改,blog预设内容)
    展开代码: "Expand Code",
    折叠代码: "Collapse Code",
    复制成功: "Copy successful!",
    复制失败: "Copy failed",
    未找到代码内容: "Code content not found",

    //封面(请在 themes\magzine\layout\_partial\cover.pug 里修改左侧内容后,再来这里修改右侧的翻译内容,保持一一对应关系)
    欢迎来到我的奇妙世界: "Welcome to my wonderful world",
    开始你的旅行: "Start Your Journey",
  };

  // ==========================================
  // 2. 核心逻辑
  // ==========================================
  let currentLang = localStorage.getItem("site_lang") || "zh";

  // 通用节点翻译函数
  function translateNode(node) {
    if (!node) return;

    // 1. 处理纯文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim();
      if (text && translations[text]) {
        node.nodeValue = translations[text];
      }
      return;
    }

    // 2. 处理元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      // (A) 翻译 data-label
      const label = node.getAttribute("data-label");
      if (label && translations[label]) {
        node.setAttribute("data-label", translations[label]);
      }

      // (B) ★★★ 关键修复：翻译 data-title ★★★
      const dataTitle = node.getAttribute("data-title");
      if (dataTitle && translations[dataTitle]) {
        node.setAttribute("data-title", translations[dataTitle]);
      }

      // (C) 翻译 title 属性
      const title = node.getAttribute("title");
      if (title && translations[title]) {
        node.setAttribute("title", translations[title]);
      }

      // (D) 翻译 placeholder
      if (["INPUT", "TEXTAREA"].includes(node.tagName)) {
        const placeholder = node.getAttribute("placeholder");
        if (placeholder && translations[placeholder]) {
          node.setAttribute("placeholder", translations[placeholder]);
        }
      }

      // (E) 翻译 data-text (用于 CSS content)
      const dataText = node.getAttribute("data-text");
      if (dataText && translations[dataText]) {
        node.setAttribute("data-text", translations[dataText]);
      }

      // 递归处理子节点
      Array.from(node.childNodes).forEach(translateNode);
    }
  }

  // ★★★ 新增：日期翻译辅助函数 (还原原味中文) ★★★
  function translateDates() {
    const dateElements = document.querySelectorAll(
      ".archive-date time, .article-date, .post-date time, .related-date time",
    );

    dateElements.forEach((el) => {
      // 1. 如果没有保存过原始文本，先存起来（这就是你 Hexo 生成的默认中文格式）
      if (!el.hasAttribute("data-original-text")) {
        el.setAttribute("data-original-text", el.textContent.trim());
      }

      // 2. 获取标准日期用于英文转换
      const dateStr =
        el.getAttribute("data-date-standard") || el.getAttribute("datetime");
      if (!dateStr) return;

      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return;

      if (currentLang === "en") {
        // === 英文模式：转换格式 ===
        if (el.parentElement.classList.contains("archive-date")) {
          // 归档页: Feb 24
          el.textContent = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else {
          // 其他页: Jan 28, 2026
          el.textContent = dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
      } else {
        // === 中文模式：还原原本的样子 ===
        // 直接从属性里拿回最初的文本，不再自己拼格式
        const originalText = el.getAttribute("data-original-text");
        if (originalText) {
          el.textContent = originalText;
        }
      }
    });
  }

  // ★ 暴露给全局
  window.i18n = {
    get: function (key) {
      if (currentLang === "en" && translations[key]) {
        return translations[key];
      }
      return key;
    },
    isEn: function () {
      return currentLang === "en";
    },
    translateNode: function (node) {
      if (currentLang === "en") {
        translateNode(node);
      }
    },
    // ★★★ 新增：将日期翻译函数也暴露出来供外部调用 ★★★
    translateDates: translateDates,
  };

  function translatePage() {
    translateNode(document.body);
    // 翻译日期
    translateDates();
  }

  function setupObservers() {
    if (currentLang !== "en") return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(translateNode);
        if (mutation.type === "characterData") translateNode(mutation.target);
        if (mutation.type === "childList") {
          mutation.target.childNodes.forEach(translateNode);
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function setupLanguageButton() {
    const buttons = document.querySelectorAll('a[href*="#lang-switch"]');
    buttons.forEach((btn) => {
      btn.innerText = currentLang === "en" ? "🇨🇳 中文" : "🇺🇸 English";
      btn.removeAttribute("href");
      btn.style.cursor = "pointer";
      btn.onclick = (e) => {
        e.preventDefault();
        const newLang = currentLang === "en" ? "zh" : "en";
        localStorage.setItem("site_lang", newLang);
        location.reload();
      };
    });
  }

  // 即使是中文模式，也要运行 translateDates 来保存原始文本
  // 这样当用户点击切换时，我们才有东西可以还原
  if (currentLang === "en") {
    translatePage();
    setupObservers();
  } else {
    // 如果当前是中文，只需扫描一遍把原始日期存进属性里，不改内容
    translateDates();
  }

  setupLanguageButton();
});
