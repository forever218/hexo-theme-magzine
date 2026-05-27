/**
 * ============================================
 * 模块4: 图层管理 (pet-layers.js)
 * ============================================
 *
 * 图层从高到低：
 *   z=40  精灵图 + 汗水粒子
 *   z=30  头发
 *   z=20  光环
 *   z=5   烟雾粒子（沿移动轨迹排列）
 *   z=1   影子（最底层）
 *
 * 本次修改：
 *   · 影子 z-index 改为最底层 (z=1)
 *   · 汗水透明度改为 40% (opacity: 0.4)
 *   · 烟雾粒子最大 16×16，最小 2×2
 *   · 粒子沿移动轨迹排列，间隔拉大
 *   · 光环缩放 0.3 倍
 */

import { State } from "./pet-sprite.js";

// ===== 配置 =====
const LC = {
  // —— 光环 ——
  // 【修改】原左朝向时为 {x:12, y:-7}，现竖直镜像对称，X坐标取反。
  HALO_L: { x: -12, y: -7 },
  HALO_R: { x: 12, y: -7 },
  HALO_ROT: 27.4,
  // 【修改】缩放放大8倍
  HALO_SCALE: 0.25 * 0.3 * 8,

  // —— 影子 ——
  SHADOW_ALPHA: 193 / 255,
  // 【修改】为了让阴影宽度(sw)等于角色宽度(W≈38.4px)，计算得知 SHADOW_SCALE 需要约为 0.6
  SHADOW_SCALE: 0.6,

  // —— 汗水 ——
  SWEAT_L: [
    { x: -12, y: -26 },
    { x: -14, y: -21 },
    { x: -12, y: -17 },
  ],
  SWEAT_R: [
    { x: 12, y: -26 },
    { x: 14, y: -21 },
    { x: 12, y: -17 },
  ],
  SWEAT_LIFE: 0.2,
  SWEAT_SIZE: 16,
  SWEAT_SPREAD: 20,
  SWEAT_OPACITY: 0.4, // ★ 汗水透明度 40%

  // —— 烟雾粒子 ——
  SMOKE_N: 1, // ★ 每次生成 1 个粒子（沿轨迹排列）
  SMOKE_LIFE: 0.8,
  SMOKE_MIN_PX: 2, // ★ 最小 2×2
  SMOKE_MAX_PX: 16, // ★ 最大 16×16
  SMOKE_INTERVAL: 0.12, // ★ 间隔拉大（轨迹更稀疏）
};

export class PetLayers {
  /**
   * @param {object} els
   * @param {HTMLElement} els.haloEl
   * @param {HTMLElement} els.shadowEl
   * @param {HTMLElement} els.sweatContainer
   * @param {HTMLElement} els.smokeContainer
   * @param {string}      imgPath
   */
  constructor(els, imgPath) {
    this.haloEl = els.haloEl;
    this.shadowEl = els.shadowEl;
    this.sweatC = els.sweatContainer;
    this.smokeC = els.smokeContainer;
    this.img = imgPath;

    this.sweatT = 0;
    this.smokeT = 0;

    // ★ 记录上一次粒子生成位置，用于沿轨迹排列
    this.lastSmokePos = null;

    this._initHalo();
    this._initShadow();
  }

  // ==================== 光环 ====================
  _initHalo() {
    const el = this.haloEl;
    if (!el) return;
    el.style.backgroundImage = `url('${this.img}halo.png')`;
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.imageRendering = "pixelated";
    el.style.pointerEvents = "none";
  }

  _updateHalo(right, ofsY, sc) {
    const el = this.haloEl;
    if (!el) return;

    const off = right ? LC.HALO_R : LC.HALO_L;
    // ★ 光环位置也要乘以角色缩放比
    const px = off.x * sc * 0.3;
    const py = off.y * sc * 0.3 + ofsY;
    const size = 64 * LC.HALO_SCALE * sc;

    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.left = px - size / 2 + "px";
    el.style.top = py - size / 2 + "px";

    const flipX = right ? -1 : 1;
    el.style.transform = `scaleX(${flipX}) rotate(${LC.HALO_ROT}deg)`;
  }

  // ==================== 影子 ====================
  _initShadow() {
    const el = this.shadowEl;
    if (!el) return;
    el.style.backgroundImage = `url('${this.img}shadow.png')`;
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.imageRendering = "pixelated";
    el.style.pointerEvents = "none";
    el.style.opacity = LC.SHADOW_ALPHA;
  }

  // ==================== 影子 ====================
  _updateShadow(state, posX, posY, fallY, sc) {
    const el = this.shadowEl;
    if (!el) return;

    const sw = 64 * LC.SHADOW_SCALE * sc;
    const sh = sw * 0.3;
    el.style.width = sw + "px";
    el.style.height = sh + "px";
    el.style.display = "block";

    // ★ 核心修改：移除状态判断，无论何时影子都固定在脚底中央
    el.style.left = -sw / 2 + "px";
    el.style.top = -sh / 2 + "px";
  }

  // ==================== 汗水 ====================
  _updateSweat(dt, state, right, sc) {
    if (state !== State.DRAGGING) {
      this.sweatT = 0;
      return;
    }

    this.sweatT += dt;
    if (this.sweatT < LC.SWEAT_LIFE) return;
    this.sweatT = 0;

    const positions = right ? LC.SWEAT_R : LC.SWEAT_L;
    const imgFile = right ? "sweat.png" : "sweat_L.png";

    positions.forEach((pos) => {
      const p = document.createElement("div");
      // ★ 汗水位置也乘以 0.3 匹配角色缩放
      const px = pos.x * sc * 0.3;
      const py = pos.y * sc * 0.3;
      p.style.cssText = `
        position:absolute;
        width:${LC.SWEAT_SIZE * 0.3}px; height:${LC.SWEAT_SIZE * 0.3}px;
        background:url('${this.img}${imgFile}') center/contain no-repeat;
        image-rendering:pixelated; pointer-events:none;
        left:${px}px; top:${py}px;
        opacity:${LC.SWEAT_OPACITY};
      `;

      const sx = (pos.x > 0 ? 1 : -1) * LC.SWEAT_SPREAD * 0.3;
      const sy = (pos.y > 0 ? 0.3 : -0.5) * LC.SWEAT_SPREAD * 0.3;
      p.style.setProperty("--spread-x", sx + "px");
      p.style.setProperty("--spread-y", sy + "px");
      p.style.animation = `pet-sweat-anim ${LC.SWEAT_LIFE}s ease-out forwards`;

      this.sweatC.appendChild(p);
      setTimeout(() => p.remove(), LC.SWEAT_LIFE * 1000 + 50);
    });
  }

  // ==================== 烟雾粒子（沿轨迹排列）====================
  /**
   * ★ 粒子不再随机散开，而是直接落在角色脚底的"过去位置"上，
   *    形成沿移动轨迹排列的效果。
   *    每个粒子 2~16px 随机大小，越老越透明。
   */
  _updateSmoke(dt, state, sc, posX, posY) {
    if (state !== State.RUNNING) {
      this.smokeT = 0;
      this.lastSmokePos = null;
      return;
    }

    this.smokeT += dt;
    if (this.smokeT < LC.SMOKE_INTERVAL) return;
    this.smokeT = 0;

    // ★ 间隔检查：与上次生成位置的距离必须足够大
    if (this.lastSmokePos) {
      const d = Math.hypot(
        posX - this.lastSmokePos.x,
        posY - this.lastSmokePos.y,
      );
      if (d < 8) return; // 距离太近不生成，拉大间隔
    }
    this.lastSmokePos = { x: posX, y: posY };

    // 生成粒子
    const p = document.createElement("div");
    // ★ 随机大小 2~16px
    const sz =
      LC.SMOKE_MIN_PX + Math.random() * (LC.SMOKE_MAX_PX - LC.SMOKE_MIN_PX);
    // ★ 初始透明度随机，靠近角色的更淡
    const alpha = 0.2 + Math.random() * 0.5;
    const life = LC.SMOKE_LIFE * (0.5 + Math.random() * 0.5);

    // ★ 粒子直接放在角色当前脚底位置（屏幕绝对坐标）
    //    因为 smokeContainer 跟随 pet-root 移动，所以用相对坐标 (0,0) 就是脚底
    //    但粒子生成后不会再跟着角色走（它留在原地），
    //    所以需要用绝对定位到屏幕上
    p.style.cssText = `
      position:fixed;
      width:${sz}px; height:${sz}px;
      background:url('${this.img}smoke.png') center/contain no-repeat;
      image-rendering:pixelated; pointer-events:none;
      left:${posX - sz / 2}px; top:${posY - sz / 2}px;
      opacity:${alpha};
      transition: opacity ${life}s ease-out;
      z-index:99994;
    `;

    // 直接挂到 body 上，这样粒子留在原地不跟随角色移动
    document.body.appendChild(p);

    // 下一帧开始淡出
    requestAnimationFrame(() => {
      p.style.opacity = "0";
    });

    // 生命周期结束后移除
    setTimeout(() => p.remove(), life * 1000 + 50);
  }

  // ==================== 综合更新 ====================
  /**
   * @param {object} p
   * @param {number}  p.dt
   * @param {number}  p.state
   * @param {boolean} p.facingRight
   * @param {number}  p.posX, p.posY    - 角色屏幕坐标
   * @param {number}  p.spriteOffsetY
   * @param {number}  p.fallTargetY
   * @param {number}  p.scale
   */
  update(p) {
    this._updateHalo(p.facingRight, p.spriteOffsetY, p.scale);
    this._updateShadow(p.state, p.posX, p.posY, p.fallTargetY, p.scale);
    this._updateSweat(p.dt, p.state, p.facingRight, p.scale);
    // ★ 传入角色屏幕坐标用于轨迹定位
    this._updateSmoke(p.dt, p.state, p.scale, p.posX, p.posY);
  }
}
