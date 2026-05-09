// Music Player - Floating Music Player
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMusicPlayer();
  });

  function initMusicPlayer() {
    const player = document.querySelector(".music-player");
    if (!player) return;

    const audio = document.querySelector(".music-player-audio");
    const toggleBtn = player.querySelector(".music-player-toggle");
    const toggleIcon = toggleBtn ? toggleBtn.querySelector("i") : null;

    const playerStyle = player.dataset.style || "pill";
    const pcPosition = player.dataset.pcPosition || "floating";
    const isPill = playerStyle === "pill";

    const mini = isPill
      ? player.querySelector(".music-player-pill")
      : player.querySelector(".music-player-card");

    if (!mini) return;

    // ----- UI Position Logic -----
    if (window.innerWidth > 768) {
      if (pcPosition === "header") {
        const navLogo = document.querySelector(".nav-logo");
        if (navLogo) {
          navLogo.insertAdjacentElement("afterend", player);
          player.classList.add("in-header");
          player.classList.remove("collapsed");
        }
      } else if (pcPosition === "floating") {
        player.classList.add("is-floating");
        setTimeout(() => {
          const startTop = Math.max(
            0,
            (window.innerHeight - player.offsetHeight) / 2,
          );
          player.style.top = startTop + "px";
          player.style.left = "20px";
          player.style.bottom = "auto";
          player.style.right = "auto";
        }, 50);
        makeDraggable(player);
      }
    }

    const collapseBtn = isPill
      ? mini.querySelector(".music-player-pill-collapse")
      : mini.querySelector(".music-player-collapse");
    const collapseIcon = collapseBtn ? collapseBtn.querySelector("i") : null;

    let isPlaying = false;
    let loopMode = "list"; // "list" or "single"

    function updateIcons() {
      const collapsed = player.classList.contains("collapsed");
      if (toggleIcon) {
        toggleIcon.className = collapsed
          ? isPlaying
            ? "fas fa-pause"
            : "fas fa-play"
          : "fas fa-music";
      }
      if (collapseIcon) {
        collapseIcon.className = collapsed
          ? "fas fa-chevron-right"
          : "fas fa-chevron-left";
      }
    }

    // ----- 边界限制 Logic -----
    function enforceBoundaries() {
      if (
        !player.classList.contains("is-floating") ||
        player.classList.contains("in-header")
      )
        return;

      const rect = player.getBoundingClientRect();
      let pWidth = rect.width;
      let pHeight = rect.height;

      // ★★★ 修复折叠状态下绝对定位导致的父容器宽高塌陷为0的问题 ★★★
      if (player.classList.contains("collapsed") && toggleBtn) {
        pWidth = Math.max(pWidth, toggleBtn.offsetWidth);
        pHeight = Math.max(pHeight, toggleBtn.offsetHeight);
      }

      const maxLeft = document.documentElement.clientWidth - pWidth;
      const maxTop = window.innerHeight - pHeight;

      let currentLeft = player.offsetLeft;
      let currentTop = player.offsetTop;

      // 修正溢出
      if (currentLeft > maxLeft)
        player.style.left = Math.max(0, maxLeft) + "px";
      if (currentTop > maxTop) player.style.top = Math.max(0, maxTop) + "px";
      if (currentLeft < 0) player.style.left = "0px";
      if (currentTop < 0) player.style.top = "0px";
    }

    // 监听窗口大小变化
    window.addEventListener("resize", enforceBoundaries);

    function togglePlayer() {
      if (
        player.classList.contains("in-header") &&
        !player.classList.contains("in-modal-mode")
      )
        return;

      player.classList.toggle("collapsed");
      updateIcons();

      if (
        player.classList.contains("is-floating") &&
        !player.classList.contains("in-modal-mode")
      ) {
        setTimeout(() => {
          enforceBoundaries();
        }, 350);
      }

      try {
        localStorage.setItem(
          "music-player-collapsed",
          player.classList.contains("collapsed"),
        );
      } catch (e) {}
    }

    if (toggleBtn)
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlayer();
      });
    if (collapseBtn)
      collapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlayer();
      });

    if (!player.classList.contains("in-header")) {
      try {
        if (localStorage.getItem("music-player-collapsed") === "true") {
          player.classList.add("collapsed");
          updateIcons();
        }
      } catch (e) {}
    }

    const playBtn = mini.querySelector(".music-player-play");
    const prevBtn = mini.querySelector(".music-player-prev");
    const nextBtn = mini.querySelector(".music-player-next");
    const loopBtn = mini.querySelector(".music-player-loop");

    const titleEl = isPill
      ? mini.querySelector(".music-player-pill-title")
      : mini.querySelector(".music-player-title");
    const artistEl = isPill
      ? mini.querySelector(".music-player-pill-artist")
      : mini.querySelector(".music-player-artist");
    const coverEl = isPill
      ? mini.querySelector(".music-player-pill-cover img")
      : mini.querySelector(".music-player-cover img");

    let songs = [];
    const songsData = player.dataset.songs;
    if (songsData) {
      try {
        songs = JSON.parse(songsData);
      } catch (e) {
        console.warn("Failed to parse songs data:", e);
      }
    }

    if (songs.length === 0) {
      if (titleEl) titleEl.textContent = "未在播放";
      if (artistEl) artistEl.textContent = "请在 _config.yml 中配置歌曲";
      return;
    }

    let currentIndex = 0;
    loadSong(0);

    function togglePlay() {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        player.classList.remove("playing");
      } else {
        audio.play().catch((err) => console.warn("Audio play failed:", err));
        isPlaying = true;
        player.classList.add("playing");
      }
      updatePlayButton();
    }

    function updatePlayButton() {
      if (!playBtn) return;
      playBtn.innerHTML = isPlaying
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
      updateIcons();
    }

    if (playBtn)
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlay();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        prevSong();
      });
    if (nextBtn)
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextSong();
      });

    if (loopBtn) {
      loopBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        loopMode = loopMode === "list" ? "single" : "list";
        loopBtn.innerHTML =
          loopMode === "list"
            ? '<i class="fas fa-retweet"></i>'
            : '<i class="fas fa-repeat"></i><span style="font-size:10px;font-weight:bold;margin-left:-6px;">1</span>';

        loopBtn.setAttribute(
          "data-title",
          loopMode === "list" ? "列表循环" : "单曲循环",
        );
      });
    }

    function resumeIfPlaying() {
      if (isPlaying) audio.play().catch(() => {});
    }

    function prevSong() {
      currentIndex = (currentIndex - 1 + songs.length) % songs.length;
      loadSong(currentIndex);
      resumeIfPlaying();
    }

    function nextSong() {
      currentIndex = (currentIndex + 1) % songs.length;
      loadSong(currentIndex);
      resumeIfPlaying();
    }

    function loadSong(index) {
      const song = songs[index];
      if (!song) return;
      audio.src = song.src;
      if (titleEl) titleEl.textContent = song.title;
      if (artistEl) artistEl.textContent = song.artist || "-";
      if (coverEl && song.cover) {
        coverEl.src = song.cover;
        coverEl.style.animation = "none";
        coverEl.offsetHeight;
        coverEl.style.animation = null;
      }
    }

    audio.addEventListener("ended", function () {
      if (loopMode === "single") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextSong();
        audio.play().catch(() => {});
      }
      isPlaying = true;
      player.classList.add("playing");
      updatePlayButton();
    });

    if (player.dataset.autoplay === "true") {
      setTimeout(function () {
        togglePlay();
      }, 500);
    }

    // ----- Draggable Logic -----
    function makeDraggable(el) {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

      el.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        if (
          !el.classList.contains("is-floating") ||
          el.classList.contains("in-modal-mode")
        )
          return;

        e = e || window.event;

        if (
          e.target.closest(".music-player-btn") &&
          !e.target.closest(".music-player-toggle")
        )
          return;

        if (!e.target.closest(".music-player-toggle")) {
          e.preventDefault();
        }

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newTop = el.offsetTop - pos2;
        let newLeft = el.offsetLeft - pos1;

        const rect = el.getBoundingClientRect();
        let pWidth = rect.width;
        let pHeight = rect.height;

        // ★★★ 修复折叠状态下拖拽时，绝对定位导致的父容器宽高塌陷问题 ★★★
        if (el.classList.contains("collapsed")) {
          const tBtn = el.querySelector(".music-player-toggle");
          if (tBtn) {
            pWidth = Math.max(pWidth, tBtn.offsetWidth);
            pHeight = Math.max(pHeight, tBtn.offsetHeight);
          }
        }

        const maxLeft = document.documentElement.clientWidth - pWidth;
        const maxTop = window.innerHeight - pHeight;

        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newTop > maxTop) newTop = maxTop;
        if (newLeft > maxLeft) newLeft = maxLeft;

        el.style.top = newTop + "px";
        el.style.left = newLeft + "px";
        el.style.bottom = "auto";
        el.style.right = "auto";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  }
})();
