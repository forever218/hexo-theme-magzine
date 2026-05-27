/**
 * ============================================
 * 模块1: 角色序列帧播放器 (pet-sprite.js)
 * ============================================
 *
 * 管理角色四个状态的序列帧动画：
 *   IDLE     (静止)    → 01.png ~ 04.png
 *   RUNNING  (奔跑)    → 05.png ~ 08.png
 *   DRAGGING (拖拽)    → 09.png ~ 12.png
 *   FALL     (掉落)    → 05.png ~ 08.png (复用奔跑帧)
 *
 * 注意：
 *   - 除 DRAGGING 外，其他状态角色始终保持竖直站姿
 *   - 角色原始朝向为左侧；朝右时通过 CSS scaleX(-1) 镜像翻转
 */

// ===== 状态枚举 =====
export const State = Object.freeze({
  IDLE: 0, // 静止
  RUNNING: 1, // 奔跑
  DRAGGING: 2, // 被拖拽
  FALL: 3, // 掉落
});

// ===== 每个状态对应的帧文件名 =====
const STATE_FRAMES = {
  [State.IDLE]: ["01", "02", "03", "04"],
  [State.RUNNING]: ["05", "06", "07", "08"],
  [State.DRAGGING]: ["09", "10", "11", "12"],
  [State.FALL]: ["05", "06", "07", "08"],
};

export class PetSprite {
  /**
   * @param {HTMLElement} spriteEl - 显示精灵图的 DOM 元素
   * @param {string}      imgPath  - 图片路径前缀，如 '/images/pet/'
   * @param {number}      frameRate - 帧率（每秒帧数），默认 12
   */
  constructor(spriteEl, imgPath, frameRate = 12) {
    this.spriteEl = spriteEl;
    this.imgPath = imgPath;
    this.frameRate = frameRate;

    // 当前状态 & 当前帧
    this.currentState = State.IDLE;
    this.currentFrame = 0;

    // 累计计时器
    this.timer = 0;

    // 预加载图片缓存
    this.imageCache = {};
    this._preloadAll();
  }

  /**
   * 预加载全部 12 张序列帧，避免运行时闪白
   */
  _preloadAll() {
    for (let i = 1; i <= 12; i++) {
      const key = String(i).padStart(2, "0");
      const img = new Image();
      img.src = `${this.imgPath}${key}.png`;
      this.imageCache[key] = img.src;
    }
    // 立即显示第一帧
    this._applyFrame();
  }

  /**
   * 切换到指定状态
   * @param {number} newState - State 枚举值
   */
  setState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.currentFrame = 0;
      this.timer = 0;
      this._applyFrame();
    }
  }

  /**
   * 每帧调用，驱动动画前进
   * @param {number} dt - 距上一帧的秒数
   */
  update(dt) {
    this.timer += dt;
    const interval = 1 / this.frameRate;

    if (this.timer >= interval) {
      this.timer -= interval;
      this.currentFrame = (this.currentFrame + 1) % 4;
      this._applyFrame();
    }
  }

  /**
   * 把当前帧的图片设到 DOM 元素上
   */
  _applyFrame() {
    const frames = STATE_FRAMES[this.currentState];
    if (!frames) return;
    const key = frames[this.currentFrame];
    const src = this.imageCache[key];
    if (src) {
      this.spriteEl.style.backgroundImage = `url('${src}')`;
    }
  }

  /** 获取当前状态 */
  getState() {
    return this.currentState;
  }
}
