/**
 * ============================================
 * 模块2: 角色状态机 + 动画 + 鼠标交互 (pet-state.js)
 * ============================================
 *
 * 四种状态的完整逻辑：
 *
 * ① IDLE（静止）
 *    - 速度为零时的状态
 *    - 检测鼠标在角色左侧/右侧 → 决定朝向
 *    - 以角色为中心有一个"长方形检测区域"，鼠标进入则保持IDLE
 *    - 可通过 DEBUG_ZONE 开关显示区域颜色
 *
 * ② RUNNING（奔跑）
 *    - 鼠标离开检测区域 → 角色朝鼠标移动
 *    - 有加速、匀速、减速过程
 *    - 换向保护：角色必须先减速到停止才能翻转方向
 *
 * ③ DRAGGING（拖拽）
 *    - 鼠标点击角色并长按左键 → 拖动
 *    - 挂载点B在角色顶部中心，鼠标为牵引点A
 *    - A与B之间有弹力绳（弹性系数 + 鼠标速度影响绳长）
 *    - 移动时角色像秤砣跟随（贪吃蛇效果）
 *    - 静止时角色以B为轴轻轻晃动（挣扎）
 *    - 短点击不拖 → 角色"逃跑"后自动回来追鼠标
 *
 * ④ FALL（掉落）
 *    - 松开鼠标后角色获得重力，掉落一小段距离
 *    - 掉落高度 ≈ 精灵图高度
 */

import { State } from "./pet-sprite.js";

// ===== 工具函数 =====
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// ===== 可调参数 =====
// ★ 速度相关参数全部降到原来的 0.3 倍 ★
const CFG = {
  // —— 检测区域（以角色中心为原点的长方形半宽/半高）——
  DETECT_HALF_W: 30, // 缩小检测区域匹配缩小后的角色
  DETECT_HALF_H: 25,
  // ★ 设为 true 可显示绿色半透明区域，调试完成后设回 false ★
  DEBUG_ZONE: false,

  // —— 移动（全部 × 0.3）——
  MAX_SPEED: 60, // 200 × 0.3
  ACCEL: 180, // 600 × 0.3
  DECEL: 240, // 800 × 0.3

  // —— 拖拽绳子 ——
  ROPE_BASE: 3, // 5 × 0.3 ≈ 3
  ROPE_STRETCH: 0.04, // 0.12 × 0.3
  ROPE_MAX: 24, // 80 × 0.3
  ROPE_K: 50, // 弹簧刚度不变
  ROPE_DAMP: 0.88,

  // —— 拖拽跳跃动画 ——
  DRAG_JUMP_V: -60, // -200 × 0.3
  DRAG_GRAVITY: 180, // 600 × 0.3

  // —— 挣扎晃动 ——
  SWING_ANGLE: Math.PI / 6,
  SWING_SPEED: 4,

  // —— 点击逃跑 ——
  FLEE_SPEED: 90, // 300 × 0.3
  FLEE_TIME: 0.4,

  // —— 掉落 ——
  FALL_GRAVITY: 180, // 600 × 0.3
  FALL_DIST: 12, // 40 × 0.3

  // —— 换向保护 ——
  DIR_CD: 0.15,
};

export class PetStateMachine {
  /**
   * @param {object} opts
   * @param {HTMLElement}           opts.rootEl
   * @param {HTMLElement}           opts.innerEl
   * @param {HTMLElement}           opts.spriteEl
   * @param {HTMLElement}           opts.debugZoneEl
   * @param {import('./pet-sprite.js').PetSprite} opts.sprite
   * @param {number}                opts.spriteW   - 精灵图显示宽 px
   * @param {number}                opts.spriteH   - 精灵图显示高 px
   * @param {Function}              opts.onStateChange
   */
  constructor(opts) {
    this.rootEl = opts.rootEl;
    this.innerEl = opts.innerEl;
    this.spriteEl = opts.spriteEl;
    this.debugZoneEl = opts.debugZoneEl;
    this.sprite = opts.sprite;
    this.spriteW = opts.spriteW || 128;
    this.spriteH = opts.spriteH || 128;
    this.onStateChange = opts.onStateChange || (() => {});

    // —— 位置（"脚底中心"屏幕坐标）——
    this.pos = {
      x: Math.max(window.innerWidth - 150, 100),
      y: Math.max(window.innerHeight - 60, 100),
    };

    this.velocity = { x: 0, y: 0 };
    this.mousePos = { x: this.pos.x, y: this.pos.y };

    // —— 状态 ——
    this.state = State.IDLE;

    // —— 朝向：false=朝左(默认)  true=朝右 ——
    this.facingRight = false;
    this.dirCooldown = 0;

    // —— 拖拽 ——
    this.isDragging = false;
    this.dragAnchor = { x: 0, y: 0 };
    this.dragVel = { x: 0, y: 0 };
    this.ropeLen = CFG.ROPE_BASE;
    this.mouseSpeed = 0;
    this.prevMouse = { x: 0, y: 0 };
    this.dragRot = 0;
    this.dragRotVel = 0;

    // 跳跃小动画
    this.jumpPhase = "none";
    this.jumpOffset = 0;
    this.jumpVel = 0;

    // 挣扎
    this.swingT = 0;

    // 短点击逃跑
    this.fleeTimer = 0;
    this.fleeDir = { x: 0, y: 0 };
    this.mouseDownT = 0;
    this.mouseDownPos = { x: 0, y: 0 };

    // —— 掉落 ——
    this.fallTargetY = 0;
    this.fallVelY = 0;

    // 初始化
    this._initDebugZone();
    this._bindEvents();
  }

  // ===================== 调试检测区域 =====================
  _initDebugZone() {
    const el = this.debugZoneEl;
    if (!el) return;
    if (CFG.DEBUG_ZONE) {
      el.style.display = "block";
      el.style.width = CFG.DETECT_HALF_W * 2 + "px";
      el.style.height = CFG.DETECT_HALF_H * 2 + "px";
      el.style.left = -CFG.DETECT_HALF_W + "px";
      el.style.top = -CFG.DETECT_HALF_H + "px";
      el.style.background = "rgba(0,255,0,0.15)";
      el.style.border = "1px dashed rgba(0,255,0,0.5)";
    } else {
      el.style.display = "none";
    }
  }

  // ===================== 事件绑定 =====================
  _bindEvents() {
    // 鼠标/触摸 移动
    window.addEventListener("mousemove", (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length) {
          this.mousePos.x = e.touches[0].clientX;
          this.mousePos.y = e.touches[0].clientY;
        }
      },
      { passive: false },
    );

    // 左键按下（在角色身上）
    this.innerEl.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        // 仅左键
        e.preventDefault();
        this._onDown(e.clientX, e.clientY);
      }
    });
    this.innerEl.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        if (e.touches.length)
          this._onDown(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: false },
    );

    // 松开
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this._onUp(); // 仅左键松开
    });
    window.addEventListener("touchend", () => this._onUp());

    // ★ 禁用角色上的右键默认菜单（由 pet-sound.js 的菜单接管）★
    this.innerEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  /** 指针按下 */
  _onDown(px, py) {
    this.isDragging = true;
    this.mouseDownT = performance.now();
    this.mouseDownPos = { x: px, y: py };
    this.prevMouse = { x: px, y: py };
    this.mouseSpeed = 0;

    // 挂载点B = 角色顶部中心
    this.dragAnchor.x = this.pos.x;
    this.dragAnchor.y = this.pos.y - this.spriteH;
    this.dragVel = { x: 0, y: 0 };
    this.ropeLen = CFG.ROPE_BASE;

    //跳跃小动画
    // ★ 核心修改 1：初始设为 wait 状态，等待判定，先不给速度
    this.jumpPhase = "wait";
    this.jumpOffset = 0;
    this.jumpVel = 0;

    // 重置旋转
    this.dragRot = 0;
    this.dragRotVel = 0;
    this.swingT = 0;
  }

  /** 指针松开 */
  _onUp() {
    if (!this.isDragging) return;

    const elapsed = performance.now() - this.mouseDownT;
    const dist = Math.hypot(
      this.mousePos.x - this.mouseDownPos.x,
      this.mousePos.y - this.mouseDownPos.y,
    );
    this.isDragging = false;

    // 短点击（<200ms 且移动<10px）→ 逃跑
    if (elapsed < 200 && dist < 10) {
      this._triggerFlee();
      return;
    }

    // 否则 → 掉落
    this._enterFall();
  }

  /** 触发逃跑 */
  _triggerFlee() {
    const dx = this.pos.x - this.mousePos.x;
    const dirX = dx >= 0 ? 1 : -1;
    this.fleeDir = { x: dirX, y: 0 };
    this.fleeTimer = CFG.FLEE_TIME;
    this.velocity.x = dirX * CFG.FLEE_SPEED;
    this.velocity.y = 0;
  }

  /** 进入掉落状态 */
  _enterFall() {
    this.fallTargetY = this.pos.y + CFG.FALL_DIST;
    this.fallVelY = 0;
    this.dragRot = 0;
    this.jumpPhase = "none";
    this.jumpOffset = 0;
  }

  /** 鼠标是否在检测区域内 */
  _inZone() {
    return (
      Math.abs(this.mousePos.x - this.pos.x) < CFG.DETECT_HALF_W &&
      Math.abs(this.mousePos.y - this.pos.y) < CFG.DETECT_HALF_H
    );
  }

  // ===================== 主 update =====================
  update(dt) {
    dt = Math.min(dt, 0.05);

    // 鼠标速度
    if (dt > 0) {
      this.mouseSpeed =
        Math.hypot(
          this.mousePos.x - this.prevMouse.x,
          this.mousePos.y - this.prevMouse.y,
        ) / dt;
      this.prevMouse.x = this.mousePos.x;
      this.prevMouse.y = this.mousePos.y;
    }

    // 换向冷却
    if (this.dirCooldown > 0) this.dirCooldown -= dt;

    // 确定状态
    const prev = this.state;
    this.state = this._nextState();
    if (prev !== this.state) {
      this.onStateChange(this.state, prev);
      this.sprite.setState(this.state);
    }

    // 执行对应逻辑
    switch (this.state) {
      case State.IDLE:
        this._tickIdle(dt);
        break;
      case State.RUNNING:
        this._tickRunning(dt);
        break;
      case State.DRAGGING:
        this._tickDragging(dt);
        break;
      case State.FALL:
        this._tickFall(dt);
        break;
    }

    // 更新帧动画
    this.sprite.update(dt);

    // 限制屏幕范围
    this.pos.x = clamp(this.pos.x, 20, window.innerWidth - 20);
    this.pos.y = clamp(this.pos.y, 60, window.innerHeight - 10);

    // DOM 变换
    this._applyDOM();
  }

  /** 状态转移逻辑 */
  _nextState() {
    if (this.isDragging) return State.DRAGGING;
    if (this.fleeTimer > 0) return State.RUNNING;

    // 掉落尚未完成
    if (this.state === State.FALL && this.pos.y < this.fallTargetY)
      return State.FALL;

    const inZone = this._inZone();
    const speed = Math.hypot(this.velocity.x, this.velocity.y);

    // 还在减速 → 保持 RUNNING
    if (this.state === State.RUNNING && speed > 5) return State.RUNNING;

    return inZone ? State.IDLE : State.RUNNING;
  }

  // -------------------- IDLE --------------------
  _tickIdle(dt) {
    this.velocity.x = lerp(this.velocity.x, 0, 10 * dt);
    this.velocity.y = lerp(this.velocity.y, 0, 10 * dt);
    this._setFacing(this.mousePos.x - this.pos.x);
    this.dragRot = 0;
    this.jumpOffset = 0;
  }

  // -------------------- RUNNING --------------------
  _tickRunning(dt) {
    // —— 逃跑模式 ——
    if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
      this.pos.x += this.velocity.x * dt;
      this.pos.y += this.velocity.y * dt;
      this.velocity.x = lerp(this.velocity.x, 0, 2 * dt);
      this._setFacing(this.velocity.x);
      return;
    }

    const inZone = this._inZone();

    if (inZone) {
      // —— 在区域内：减速到0（不改朝向）——
      const sp = Math.hypot(this.velocity.x, this.velocity.y);
      if (sp > 5) {
        const f = Math.max(0, sp - CFG.DECEL * dt) / sp;
        this.velocity.x *= f;
        this.velocity.y *= f;
        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;
      } else {
        this.velocity.x = 0;
        this.velocity.y = 0;
      }
    } else {
      // —— 在区域外：朝鼠标加速 ——
      const dx = this.mousePos.x - this.pos.x;
      const dy = this.mousePos.y - this.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const nx = dx / dist;
        const ny = dy / dist;
        const sp = Math.hypot(this.velocity.x, this.velocity.y);
        const dot = this.velocity.x * nx + this.velocity.y * ny;

        if (sp > 10 && dot < 0) {
          // 方向相反 → 先减速
          const f = Math.max(0, sp - CFG.DECEL * dt) / sp;
          this.velocity.x *= f;
          this.velocity.y *= f;
        } else {
          // 方向一致 → 加速
          this.velocity.x += nx * CFG.ACCEL * dt;
          this.velocity.y += ny * CFG.ACCEL * dt;
          const ns = Math.hypot(this.velocity.x, this.velocity.y);
          if (ns > CFG.MAX_SPEED) {
            this.velocity.x = (this.velocity.x / ns) * CFG.MAX_SPEED;
            this.velocity.y = (this.velocity.y / ns) * CFG.MAX_SPEED;
          }
          this._setFacing(this.velocity.x);
        }

        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;
      }
    }

    this.dragRot = 0;
    this.jumpOffset = 0;
  }

  // -------------------- DRAGGING --------------------
  _tickDragging(dt) {
    // ★ 核心修改 2：判定是否转化为真正的拖拽
    if (this.jumpPhase === "wait") {
      const elapsed = performance.now() - this.mouseDownT;
      const dist = Math.hypot(
        this.mousePos.x - this.mouseDownPos.x,
        this.mousePos.y - this.mouseDownPos.y,
      );
      // 如果按下的时间超过 150ms，或者鼠标移动超过 10px，说明是长按/拖拽，触发跳跃！
      if (elapsed > 150 || dist > 10) {
        this.jumpPhase = "jumping";
        this.jumpVel = CFG.DRAG_JUMP_V;
      }
    }
    // —— 跳跃小动画 ——
    if (this.jumpPhase === "jumping") {
      this.jumpOffset += this.jumpVel * dt;
      this.jumpVel += CFG.DRAG_GRAVITY * dt;
      if (this.jumpOffset >= 0) {
        this.jumpOffset = 0;
        this.jumpPhase = "done";
      }
    }

    const A = this.mousePos;

    // —— 绳长随鼠标速度变化 ——
    const targetLen = CFG.ROPE_BASE + this.mouseSpeed * CFG.ROPE_STRETCH;
    this.ropeLen = lerp(
      this.ropeLen,
      clamp(targetLen, CFG.ROPE_BASE, CFG.ROPE_MAX),
      5 * dt,
    );

    // —— 弹簧物理：B 追赶 A ——
    const dxAB = A.x - this.dragAnchor.x;
    const dyAB = A.y - this.dragAnchor.y;
    const dAB = Math.hypot(dxAB, dyAB);

    let fx = 0,
      fy = 0;
    if (dAB > this.ropeLen && dAB > 0) {
      const over = dAB - this.ropeLen;
      fx = (dxAB / dAB) * over * CFG.ROPE_K;
      fy = (dyAB / dAB) * over * CFG.ROPE_K;
    }
    fx += dxAB * 8;
    fy += dyAB * 8;

    this.dragVel.x += fx * dt;
    this.dragVel.y += fy * dt;
    this.dragVel.x *= CFG.ROPE_DAMP;
    this.dragVel.y *= CFG.ROPE_DAMP;

    this.dragAnchor.x += this.dragVel.x * dt;
    this.dragAnchor.y += this.dragVel.y * dt;

    this.pos.x = this.dragAnchor.x;
    this.pos.y = this.dragAnchor.y + this.spriteH + this.jumpOffset;

    this.velocity.x = this.dragVel.x;
    this.velocity.y = this.dragVel.y;

    // —— 旋转 ——
    const moveSpd = Math.hypot(this.dragVel.x, this.dragVel.y);
    if (moveSpd > 30) {
      const ang = Math.atan2(
        this.pos.y - this.dragAnchor.y,
        this.pos.x - this.dragAnchor.x,
      );
      let target = ang - Math.PI / 2;
      target = clamp(target, -Math.PI * 0.6, Math.PI * 0.6);
      this.dragRot = lerp(this.dragRot, target, 8 * dt);
      this._setFacing(this.dragVel.x);
    } else {
      this.swingT += dt;
      const dir = this.facingRight ? 1 : -1;
      const angle =
        Math.sin(this.swingT * CFG.SWING_SPEED) * CFG.SWING_ANGLE * dir;
      this.dragRot = lerp(this.dragRot, angle, 5 * dt);
    }
  }

  // -------------------- FALL --------------------
  _tickFall(dt) {
    this.dragRot = lerp(this.dragRot, 0, 10 * dt);
    this.velocity.x = lerp(this.velocity.x, 0, 5 * dt);
    this.pos.x += this.velocity.x * dt;
    this.fallVelY += CFG.FALL_GRAVITY * dt;
    this.pos.y += this.fallVelY * dt;

    if (this.pos.y >= this.fallTargetY) {
      this.pos.y = this.fallTargetY;
      this.fallVelY = 0;
      this.jumpOffset = 0;
    }
  }

  // ===================== 朝向 =====================
  _setFacing(dirX) {
    if (this.dirCooldown > 0) return;
    if (Math.abs(dirX) < 1) return;
    const next = dirX > 0;
    if (next !== this.facingRight) {
      this.facingRight = next;
      this.dirCooldown = CFG.DIR_CD;
    }
  }

  // ===================== DOM =====================
  _applyDOM() {
    this.rootEl.style.transform = `translate(${this.pos.x}px,${this.pos.y}px)`;
    const sx = this.facingRight ? -1 : 1;
    const rot =
      this.state === State.DRAGGING || this.state === State.FALL
        ? this.dragRot
        : 0;
    this.innerEl.style.transform = `scaleX(${sx}) rotate(${rot}rad)`;
    this.spriteEl.style.transform =
      this.state === State.DRAGGING ? `translateY(${this.jumpOffset}px)` : "";
  }

  // ===================== 外部读取接口 =====================
  getState() {
    return this.state;
  }
  getPos() {
    return { ...this.pos };
  }
  getVelocity() {
    return { ...this.velocity };
  }
  isFacingRight() {
    return this.facingRight;
  }
  getRotation() {
    return this.dragRot;
  }
  getSpriteOffsetY() {
    return this.jumpOffset;
  }
  getFallTargetY() {
    return this.fallTargetY || this.pos.y + CFG.FALL_DIST;
  }
}
