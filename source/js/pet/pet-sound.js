/**
 * ============================================
 * 模块5: 角色音效管理 (pet-sound.js)
 * ============================================
 *
 * · RUNNING 状态循环播放跑步音效
 * · 音调随机 0.75~1.0
 * ★ 鼠标右键点击角色弹出浮动菜单：
 *    - "静音" 按钮（切换静音/取消静音）
 *    - 音量滑块
 */

import { State } from "./pet-sprite.js";

const SC = {
  PITCH_MIN: 0.75,
  PITCH_MAX: 1.0,
  DEFAULT_VOLUME: 0.3,
};

export class PetSound {
  constructor(path, innerEl) {
    this.audio = new Audio(path);
    this.audio.loop = true;

    // 需求③：从本地存储读取静音状态和音量
    this.muted = localStorage.getItem("pet_sound_muted") === "true";
    const savedVol = localStorage.getItem("pet_sound_volume");
    this.volume = savedVol ? parseFloat(savedVol) : SC.DEFAULT_VOLUME;

    this.audio.volume = this.volume;
    this.audio.muted = this.muted;

    this.playing = false;
    this.unlocked = false;

    this.menuEl = null;
    this.innerEl = innerEl;

    const unlock = () => {
      this.unlocked = true;
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("touchstart", unlock);

    this._createMenu();
    this._bindContextMenu();
  }

  _createMenu() {
    const menu = document.createElement("div");
    menu.id = "pet-sound-menu";

    // 角色音效区块
    const soundLabel = document.createElement("div");
    soundLabel.className = "pet-menu-label";
    soundLabel.innerHTML = `<i class="fas fa-shoe-prints"></i> 角色音效`;

    const muteBtn = document.createElement("button");
    muteBtn.className = "pet-menu-btn";
    muteBtn.innerHTML = this.muted
      ? `<i class="fas fa-volume-mute"></i> 取消静音`
      : `<i class="fas fa-volume-up"></i> 静音`;

    muteBtn.addEventListener("click", () => {
      this.muted = !this.muted;
      this.audio.muted = this.muted;
      localStorage.setItem("pet_sound_muted", this.muted); // 保存
      muteBtn.innerHTML = this.muted
        ? `<i class="fas fa-volume-mute"></i> 取消静音`
        : `<i class="fas fa-volume-up"></i> 静音`;
    });

    const volSlider = document.createElement("input");
    volSlider.type = "range";
    volSlider.min = "0";
    volSlider.max = "100";
    volSlider.value = String(Math.round(this.volume * 100));
    volSlider.addEventListener("input", () => {
      this.volume = parseInt(volSlider.value) / 100;
      this.audio.volume = this.volume;
      localStorage.setItem("pet_sound_volume", this.volume); // 保存
    });

    const divider = document.createElement("div");
    divider.className = "pet-menu-divider";

    menu.appendChild(soundLabel);
    menu.appendChild(muteBtn);
    menu.appendChild(volSlider);
    menu.appendChild(divider);

    document.body.appendChild(menu);
    this.menuEl = menu;
    this.muteBtn = muteBtn;

    // 需求④：点击外部区域关闭菜单
    const closeMenu = (e) => {
      if (
        menu.classList.contains("menu-show") &&
        !menu.contains(e.target) &&
        !this.innerEl.contains(e.target)
      ) {
        menu.classList.remove("menu-show");
        setTimeout(() => {
          if (!menu.classList.contains("menu-show"))
            menu.style.display = "none";
        }, 200);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("touchstart", closeMenu);
  }

  _bindContextMenu() {
    if (!this.innerEl) return;
    this.innerEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._showMenu(e.clientX, e.clientY);
    });
  }

  _showMenu(x, y) {
    const menu = this.menuEl;
    if (!menu) return;

    menu.style.display = "block";
    // 强制回流以触发动画
    menu.offsetHeight;
    menu.classList.add("menu-show");

    const rect = menu.getBoundingClientRect();
    const mx = Math.min(x, window.innerWidth - rect.width - 10);
    const my = Math.min(y, window.innerHeight - rect.height - 10);

    menu.style.left = Math.max(0, mx) + "px";
    menu.style.top = Math.max(0, my) + "px";
  }

  update(state) {
    if (state === State.RUNNING) {
      this._play();
    } else {
      this._stop();
    }
  }

  _play() {
    if (this.playing || !this.unlocked) return;
    this.audio.playbackRate =
      SC.PITCH_MIN + Math.random() * (SC.PITCH_MAX - SC.PITCH_MIN);
    this.audio.play().catch(() => {});
    this.playing = true;
  }

  _stop() {
    if (!this.playing) return;
    this.audio.pause();
    this.playing = false;
  }

  destroy() {
    this._stop();
    if (this.menuEl && this.menuEl.parentNode) this.menuEl.remove();
  }
}
