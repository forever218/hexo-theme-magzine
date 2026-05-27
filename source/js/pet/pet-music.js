/**
 * =====================================================
 * 模块8：音乐播放器（pet-music.js）
 * =====================================================
 * 作用：
 * - 播放外部音乐源（mp3/ogg 等）
 * - 提供基础功能：
 *   上一首 / 下一首 / 播放暂停 / 循环 / 音量（名称“音乐音量”）
 * - UI 会被挂载到 PetSound 的右键菜单里
 *
 * 说明：
 * - “自动获取封面”取决于音乐源是否提供封面信息。
 *   这里用 playlist 的 cover 字段作为封面 URL（最稳定）。
 * -
 * 作用：深度联动并控制全局 music-player.js
 */

export class PetMusicPlayer {
  constructor() {
    this.globalPlayer = document.querySelector(".music-player");
    this.globalAudio = document.querySelector(".music-player-audio");

    // UI 引用
    this.titleEl = null;
    this.coverBtn = null;
    this.playBtn = null;
    this.volSlider = null;

    // 绑定事件同步UI
    this._syncUI = this._syncUI.bind(this);
    if (this.globalAudio) {
      this.globalAudio.addEventListener("play", this._syncUI);
      this.globalAudio.addEventListener("pause", this._syncUI);
      this.globalAudio.addEventListener("timeupdate", this._syncUI);
      setTimeout(this._syncUI, 500);
    }
  }

  // ★ 核心修复：获取当前正在使用的播放器容器（卡片 or 圆条）
  _getActiveMini() {
    if (!this.globalPlayer) return null;
    const isPill = this.globalPlayer.classList.contains("style-pill");
    return this.globalPlayer.querySelector(
      isPill ? ".music-player-pill" : ".music-player-card",
    );
  }

  _syncUI() {
    if (!this.globalPlayer) return;
    const isPill = this.globalPlayer.classList.contains("style-pill");
    const titleNode = this.globalPlayer.querySelector(
      isPill ? ".music-player-pill-title" : ".music-player-title",
    );
    const coverNode = this.globalPlayer.querySelector(
      isPill ? ".music-player-pill-cover img" : ".music-player-cover img",
    );

    if (this.titleEl && titleNode) {
      this.titleEl.textContent = titleNode.textContent;
    }

    if (this.coverBtn && coverNode) {
      this.coverBtn.style.backgroundImage = `url('${coverNode.src}')`;
    }

    if (this.playBtn) {
      const isPaused = this.globalAudio ? this.globalAudio.paused : true;
      this.playBtn.innerHTML = isPaused
        ? '<i class="fas fa-play"></i>'
        : '<i class="fas fa-pause"></i>';
    }
  }

  playPause() {
    const btn = this._getActiveMini()?.querySelector(".music-player-play");
    if (btn) btn.click();
    this._syncUI();
  }

  prev() {
    const btn = this._getActiveMini()?.querySelector(".music-player-prev");
    if (btn) btn.click();
    setTimeout(this._syncUI, 100);
  }

  next() {
    const btn = this._getActiveMini()?.querySelector(".music-player-next");
    if (btn) btn.click();
    setTimeout(this._syncUI, 100);
  }

  toggleLoop() {
    const btn = this._getActiveMini()?.querySelector(".music-player-loop");
    if (btn) btn.click();
  }

  setVolume(v01) {
    if (this.globalAudio) {
      this.globalAudio.volume = Math.max(0, Math.min(1, v01));
      localStorage.setItem("global_music_volume", this.globalAudio.volume);
    }
  }

  mountToMenu(menuEl) {
    if (!this.globalPlayer) return;

    const wrap = document.createElement("div");

    const musicLabel = document.createElement("div");
    musicLabel.className = "pet-menu-label";
    musicLabel.innerHTML = `<i class="fas fa-music"></i> 全局音乐控制`;

    const head = document.createElement("div");
    head.style.cssText = `display:flex; align-items:center; gap:10px; margin-bottom:12px;`;

    const coverBtn = document.createElement("div");
    coverBtn.style.cssText = `
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 2px solid var(--accent-color);
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const title = document.createElement("div");
    title.style.cssText = `
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 130px;
    `;
    title.textContent = "未加载音乐";

    head.appendChild(coverBtn);
    head.appendChild(title);

    const controls = document.createElement("div");
    controls.style.cssText = `display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:12px;`;

    const btnStyle = `
      width: 32px; height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--text-color);
      cursor: pointer;
      display:flex; align-items:center; justify-content:center;
      transition: all var(--transition-fast);
    `;

    const createBtn = (icon, handler) => {
      const b = document.createElement("button");
      b.style.cssText = btnStyle;
      b.innerHTML = `<i class="${icon}"></i>`;
      b.addEventListener("click", handler);
      b.addEventListener("mouseenter", () => {
        b.style.background = "var(--accent-color)";
        b.style.color = "#fff";
        b.style.borderColor = "var(--accent-color)";
      });
      b.addEventListener("mouseleave", () => {
        b.style.background = "var(--background-color)";
        b.style.color = "var(--text-color)";
        b.style.borderColor = "var(--border-color)";
      });
      return b;
    };

    const prevBtn = createBtn("fas fa-step-backward", () => this.prev());
    const playBtn = createBtn("fas fa-play", () => this.playPause());
    const nextBtn = createBtn("fas fa-step-forward", () => this.next());
    const loopBtn = createBtn("fas fa-retweet", () => this.toggleLoop());

    controls.appendChild(prevBtn);
    controls.appendChild(playBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(loopBtn);

    let savedVol = localStorage.getItem("global_music_volume");
    let initVol = savedVol !== null ? parseFloat(savedVol) : 0.8;
    if (this.globalAudio) this.globalAudio.volume = initVol;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(Math.round(initVol * 100));
    slider.addEventListener("input", () =>
      this.setVolume(parseInt(slider.value, 10) / 100),
    );

    wrap.appendChild(musicLabel);
    wrap.appendChild(head);
    wrap.appendChild(controls);
    wrap.appendChild(slider);

    menuEl.insertBefore(wrap, menuEl.firstChild);

    this.coverBtn = coverBtn;
    this.titleEl = title;
    this.playBtn = playBtn;
    this.volSlider = slider;

    this._syncUI();
  }
}
