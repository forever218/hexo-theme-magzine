document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // ★ 1. 全局解除防盗链 (绕过腾讯、B站等视频直链限制)
  // ==========================================
  let metaReferrer = document.querySelector('meta[name="referrer"]');
  if (!metaReferrer) {
    metaReferrer = document.createElement("meta");
    metaReferrer.name = "referrer";
    metaReferrer.content = "no-referrer";
    document.head.appendChild(metaReferrer);
  } else {
    metaReferrer.content = "no-referrer";
  }

  // ==========================================
  // ★ 2. 初始化配置与本地历史记录
  // ==========================================
  const animeConfig =
    window.theme && window.theme.anime ? window.theme.anime : {};
  const isHistoryEnabled = animeConfig.history !== false;
  const globalApi = animeConfig.player_api || "";
  let art = null; // 全局 Artplayer 实例

  // 提取 B站 BVID
  function extractBvid(url) {
    const match = url.match(/BV[a-zA-Z0-9]+/);
    return match ? match[0] : url;
  }

  // 判断是否为移动端
  const isMobile = () => window.innerWidth <= 768;

  // 修复原生全屏事件下的侧边栏显示问题
  document.addEventListener("fullscreenchange", function () {
    const sidebar = document.getElementById("anime-episode-sidebar");
    if (document.fullscreenElement) {
      sidebar.classList.add("fixed-fullscreen");
      document.fullscreenElement.appendChild(sidebar);
    } else {
      sidebar.classList.remove("fixed-fullscreen");
      document.querySelector(".anime-modal-body").appendChild(sidebar);
    }
  });

  // ==========================================
  // ★ 3. 核心播放控制 (切换 iframe 或 Artplayer)
  // ==========================================
  function playVideo(rawUrl, apiOverride) {
    const api = apiOverride !== undefined ? apiOverride : globalApi;
    let finalUrl = rawUrl;

    // 处理 B站视频解析逻辑
    if (api.includes("player.bilibili.com")) {
      const bvid = extractBvid(rawUrl);
      finalUrl = bvid.startsWith("BV")
        ? `${api}${bvid}&high_quality=1&danmaku=1`
        : rawUrl;
    } else {
      finalUrl = api ? `${api}${rawUrl}` : rawUrl;
    }

    const iframe = document.getElementById("anime-modal-iframe");
    const playerContainer = document.getElementById(
      "anime-artplayer-container",
    );
    const episodeSidebar = document.getElementById("anime-episode-sidebar");

    // 拦截 blob 临时链接
    if (finalUrl.startsWith("blob:")) {
      alert(
        "播放失败！\n\n检测到使用了 blob: 链接，这通常是其他网站的临时缓存，无法跨站播放。\n请换源或使用真实的 .m3u8 直链！",
      );
      iframe.style.display = "none";
      playerContainer.style.display = "none";
      return;
    }

    // 判断是否为视频直链 (m3u8, mp4 等)
    const isDirectVideo =
      finalUrl.match(/\.(mp4|m3u8|flv|webm)($|\?)/i) ||
      finalUrl.includes("toutiao50.com") ||
      finalUrl.includes("/video/tos/");

    if (isDirectVideo) {
      // 是直链：使用 Artplayer，隐藏 iframe
      iframe.style.display = "none";
      iframe.src = "";
      playerContainer.style.display = "block";

      const accentColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-color")
          .trim() || "#ff6b6b";

      let customType = {};
      if (finalUrl.includes(".m3u8") || finalUrl.includes("m3u8")) {
        customType.m3u8 = function (video, url, artInstance) {
          if (Hls.isSupported()) {
            if (artInstance.hls) artInstance.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            artInstance.hls = hls;
            if (!artInstance.hlsDestroyBound) {
              artInstance.on("destroy", () => {
                if (artInstance.hls) artInstance.hls.destroy();
              });
              artInstance.hlsDestroyBound = true;
            }
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            artInstance.notice.show = "您的浏览器不支持 m3u8 播放";
          }
        };
      }

      if (art) {
        art.switchUrl(finalUrl);
        // 如果是在移动端播放直链，且非全屏，则自动尝试进入全屏
        if (isMobile() && !art.fullscreen) {
          art.fullscreen = true;
        }
      } else {
        art = new Artplayer({
          container: playerContainer,
          url: finalUrl,
          customType: customType,
          autoplay: true,
          theme: accentColor,
          volume: 0.8,
          isLive: false,
          muted: false,
          fullscreen: true,
          pip: false,
          playbackRate: true,
          setting: true,
          autoOrientation: true,
          lock: true,
          controls: [
            {
              position: "right",
              html: '<div style="display:flex;align-items:center;gap:4px;font-size:14px;padding:0 10px;cursor:pointer;"><i class="fas fa-list-ul"></i> 选集</div>',
              tooltip: "播放列表",
              click: function () {
                episodeSidebar.classList.toggle("show");
              },
            },
          ],
        });

        // Artplayer 初始化完后自动全屏（移动端适用）
        art.on("ready", () => {
          if (isMobile()) {
            art.fullscreen = true;
          }
        });

        // 自动播放下一集
        art.on("video:ended", function () {
          const activeBtn = document.querySelector(".episode-btn.active");
          if (
            activeBtn &&
            activeBtn.nextElementSibling &&
            activeBtn.nextElementSibling.classList.contains("episode-btn")
          ) {
            art.notice.show = "即将自动播放下一集...";
            setTimeout(() => {
              activeBtn.nextElementSibling.click();
            }, 1500);
          } else {
            art.notice.show = "已经是最后一集了~";
          }
        });
      }
    } else {
      // 网页外链/第三方解析接口：使用 iframe
      if (art) {
        const safeBody = document.querySelector(".anime-modal-body");
        if (
          safeBody &&
          episodeSidebar &&
          episodeSidebar.parentNode !== safeBody
        ) {
          episodeSidebar.classList.remove("fixed-fullscreen");
          safeBody.appendChild(episodeSidebar);
        }
        art.destroy(false);
        art = null;
      }
      playerContainer.style.display = "none";
      iframe.style.display = "block";
      iframe.src = finalUrl;

      // Iframe 在移动端想要直接触发全屏稍有局限，但我们依然可以通过外层 body 请求全屏
      if (isMobile() && !document.fullscreenElement) {
        const modalBody = document.querySelector(".anime-modal-body");
        if (modalBody.requestFullscreen) {
          modalBody.requestFullscreen().catch((err) => console.log(err));
        } else if (modalBody.webkitRequestFullscreen) {
          modalBody.webkitRequestFullscreen();
        }
      }
    }
  }

  // ==========================================
  // ★ 4. 观看历史记录逻辑
  // ==========================================
  const HISTORY_KEY = "anime_watch_history";
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveHistory(title) {
    if (!isHistoryEnabled) return;
    const history = getHistory();
    history[title] = new Date().getTime();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateBadges();
  }
  function updateBadges() {
    if (!isHistoryEnabled) return;
    const history = getHistory();
    document.querySelectorAll(".bili-card-wrapper").forEach((card) => {
      const title = card.getAttribute("data-title");
      const badge = card.querySelector(".watched-badge");
      if (history[title] && badge) badge.style.display = "block";
    });
  }
  updateBadges();

  // ==========================================
  // ★ 5. 获取 DOM 元素
  // ==========================================
  const modal = document.getElementById("anime-modal");
  const modalTitle = document.getElementById("anime-modal-title");
  const modalClose = document.getElementById("anime-modal-close");
  const episodeBtn = document.getElementById("anime-episode-btn");
  const episodeSidebar = document.getElementById("anime-episode-sidebar");
  const episodeList = document.getElementById("anime-episode-list");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const sourceSelect = document.getElementById("anime-source-select");
  const contextMenu = document.getElementById("anime-context-menu");
  const charactersContainer = document.getElementById(
    "context-menu-characters",
  );
  const loadingText = document.getElementById("context-menu-loading");

  // ==========================================
  // ★ 6. 绑定卡片交互事件 (纯本地 yml 数据)
  // ==========================================
  document.querySelectorAll(".bili-card-wrapper").forEach((card) => {
    // 6.1 左键点击卡片 -> 获取播放源并打开模态框
    card.addEventListener("click", function (e) {
      if (e.button !== 0) return;

      const title = this.getAttribute("data-title");
      const defaultUrl = this.getAttribute("data-url"); // 兼容没有 sources 只有单个 url 的旧版

      // 读取 YAML 中配置好的本地源
      let yamlSources = JSON.parse(this.getAttribute("data-sources") || "[]");
      let rootEpisodes = JSON.parse(this.getAttribute("data-episodes") || "[]");

      // 兼容旧版写法：如果没有 sources 数组但有 episodes 数组
      if (yamlSources.length === 0 && rootEpisodes.length > 0) {
        yamlSources = [{ name: "默认源", episodes: rootEpisodes }];
      }

      // 无论移动端PC端，若是既没有直链也没数据，一律提示并返回，不弹空模态框
      if (yamlSources.length === 0 && !defaultUrl) {
        alert(`未能找到《${title}》的播放源，请检查 yml 配置！`);
        return;
      }

      saveHistory(title);
      contextMenu.classList.remove("show");
      modalTitle.textContent = title;

      if (yamlSources.length > 0) {
        episodeBtn.style.display = "flex";
        sourceSelect.style.display = yamlSources.length > 1 ? "block" : "none";
        sourceSelect.innerHTML = "";

        // 填充下拉菜单
        yamlSources.forEach((src, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.textContent = src.name;
          sourceSelect.appendChild(opt);
        });

        // 渲染选集按钮函数
        function renderEpisodes(sourceIndex) {
          const currentSource = yamlSources[sourceIndex];
          const eps = currentSource.episodes || [];
          episodeList.innerHTML = "";

          if (eps.length === 0) {
            episodeList.innerHTML = `<div style="padding: 20px; color: #aaa; text-align: center;">该源暂无集数数据</div>`;
            return;
          }

          eps.forEach((ep, index) => {
            const btn = document.createElement("button");
            btn.className = "episode-btn";
            if (index === 0) btn.classList.add("active");
            btn.textContent = ep.title;

            btn.addEventListener("click", () => {
              document
                .querySelectorAll(".episode-btn")
                .forEach((b) => b.classList.remove("active"));
              btn.classList.add("active");
              playVideo(ep.url, currentSource.player_api);
            });
            episodeList.appendChild(btn);
          });

          // 自动播放该源的第一集
          playVideo(eps[0].url, currentSource.player_api);
        }

        // 监听换源事件
        sourceSelect.onchange = (e) => renderEpisodes(e.target.value);

        // 默认渲染第一个源
        renderEpisodes(0);
      } else if (defaultUrl) {
        // 非常旧的单链接写法
        episodeBtn.style.display = "none";
        sourceSelect.style.display = "none";
        playVideo(defaultUrl, globalApi);
      }

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      episodeSidebar.classList.remove("show"); // 默认不展开侧边栏
    });

    // 6.2 右键点击卡片 -> 请求 Bangumi API 展示角色
    card.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      const bangumiUrl = this.getAttribute("data-bangumi");
      charactersContainer.innerHTML = "";

      let x = e.clientX;
      let y = e.clientY;
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.classList.add("show");

      const rect = contextMenu.getBoundingClientRect();
      if (x + rect.width > window.innerWidth)
        contextMenu.style.left = `${window.innerWidth - rect.width - 10}px`;
      if (y + rect.height > window.innerHeight)
        contextMenu.style.top = `${window.innerHeight - rect.height - 10}px`;

      if (!bangumiUrl) {
        charactersContainer.innerHTML =
          "<div style='grid-column: 1/-1; text-align:center; color:#888;'>未配置 bangumi_url</div>";
        return;
      }

      const subjectMatch = bangumiUrl.match(/\/subject\/(\d+)/);
      if (!subjectMatch) {
        charactersContainer.innerHTML =
          "<div style='grid-column: 1/-1; text-align:center; color:#888;'>无法解析 Bangumi ID</div>";
        return;
      }

      const subjectId = subjectMatch[1];
      loadingText.style.display = "inline";

      fetch(`https://api.bgm.tv/v0/subjects/${subjectId}/characters`)
        .then((res) => res.json())
        .then((data) => {
          loadingText.style.display = "none";
          if (!data || data.length === 0) {
            charactersContainer.innerHTML =
              "<div style='grid-column: 1/-1; text-align:center; color:#888;'>暂无角色信息</div>";
            return;
          }
          const topCharacters = data.slice(0, 30);
          topCharacters.forEach((char) => {
            const imgSrc =
              char.images && char.images.grid
                ? char.images.grid
                : "https://api.bgm.tv/v0/img/no_icon_subject.png";
            const item = document.createElement("div");
            item.className = "character-item";
            item.innerHTML = `
              <img class="character-avatar" src="${imgSrc}" alt="${char.name}" referrerpolicy="no-referrer">
              <span class="character-name" title="${char.name}">${char.name}</span>
            `;
            charactersContainer.appendChild(item);
          });
        })
        .catch((err) => {
          console.error(err);
          loadingText.style.display = "none";
          charactersContainer.innerHTML =
            "<div style='grid-column: 1/-1; text-align:center; color:#888;'>加载失败，请检查网络</div>";
        });
    });
  });

  // ==========================================
  // ★ 7. 模态框与侧边栏控制逻辑
  // ==========================================
  if (episodeBtn)
    episodeBtn.addEventListener("click", () =>
      episodeSidebar.classList.toggle("show"),
    );
  if (sidebarCloseBtn)
    sidebarCloseBtn.addEventListener("click", () =>
      episodeSidebar.classList.remove("show"),
    );

  function closeModal() {
    const safeBody = document.querySelector(".anime-modal-body");
    const safeSidebar = document.getElementById("anime-episode-sidebar");
    if (safeBody && safeSidebar && safeSidebar.parentNode !== safeBody) {
      safeSidebar.classList.remove("fixed-fullscreen");
      safeBody.appendChild(safeSidebar);
    }

    modal.classList.remove("active");
    if (episodeSidebar) episodeSidebar.classList.remove("show");

    const iframe = document.getElementById("anime-modal-iframe");
    if (iframe) iframe.src = "";
    if (art) {
      art.destroy(false);
      art = null;
    }
    document.body.style.overflow = "";

    // 如果之前强制进入了全屏，关闭模态框时可以顺便退出全屏
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.log(err));
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  // 点击空白处关闭右键角色菜单
  document.addEventListener("click", function (e) {
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.classList.remove("show");
    }
  });

  // 滚动时关闭右键角色菜单
  window.addEventListener(
    "scroll",
    function () {
      if (contextMenu && contextMenu.classList.contains("show")) {
        contextMenu.classList.remove("show");
      }
    },
    { passive: true },
  );
});
