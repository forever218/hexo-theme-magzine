/**
 * ============================================
 * 模块3: 角色头发物理模拟 (pet-hair.js)
 * ============================================
 *
 * 头发 = 三根"发丝"，每根由多个节点串联。
 * 靠近头部的节点是刚性的（紧跟头部移动），
 * 远端节点拥有弹性和惯性——
 *   · 角色静止时：头发像软橡皮泥一样轻微蠕动
 *   · 角色移动时：头发向反方向飘动（惯性甩尾）
 *   · 角色被拖拽时：头发跟随物理力甩动
 *
 * 颜色: #565a73（填充）+ #000000（描边）
 */

// ===== 配置 =====
const HC = {
  AMOUNT: 6, // 每根发丝节点数
  RIGID: 2, // 前N个节点为刚性
  K: 0.15, // 弹性系数
  INERTIA: 40, // 惯性放大
  COLOR: "#565a73",
  OUTLINE: "#000000",
  START_R: 9, // 根部圆半径
  END_R: 4, // 末端圆半径
  OUTLINE_PAD: 1.5, // 描边额外半径

  // 三根发丝偏移配置
  STRANDS: [
    { x0: -4, y0: 0, dx: -1, dy: 3 }, // 左
    { x0: 0, y0: 0, dx: 0, dy: 3 }, // 中
    { x0: 4, y0: 0, dx: 1, dy: 3 }, // 右
  ],
};

const lerp = (a, b, t) => a + (b - a) * t;

/** 单根发丝 */
class Strand {
  constructor(cfg) {
    this.cfg = cfg;
    this.pts = Array.from({ length: HC.AMOUNT }, () => ({ x: 0, y: 0 }));
  }

  /**
   * @param {number} rootX,rootY  - 根部坐标（画布坐标系）
   * @param {object} vn           - 归一化速度 {x,y}
   * @param {boolean} flip        - 朝右
   * @param {number} rot          - 旋转角
   * @param {number} t            - 时间戳ms
   */
  update(rootX, rootY, vn, flip, rot, t) {
    this.pts[0].x = rootX;
    this.pts[0].y = rootY;

    for (let i = 1; i < HC.AMOUNT; i++) {
      const prev = this.pts[i - 1];
      const curr = this.pts[i];

      if (i <= HC.RIGID) {
        // 刚性跟随
        curr.x = prev.x + this.cfg.dx;
        curr.y = prev.y + this.cfg.dy;
      } else {
        // 弹性 + 惯性
        let tx = prev.x + this.cfg.dx;
        let ty = prev.y + this.cfg.dy;

        // 蠕动
        tx += 0.5 * Math.sin(t * 0.003 + i * 1.2);

        const k = HC.K + 0.5 / (i * i);

        // 抵消旋转
        const c = Math.cos(-rot),
          s = Math.sin(-rot);
        let uvx = vn.x * c - vn.y * s;
        let uvy = vn.x * s + vn.y * c;
        // 抵消翻转
        const lvx = uvx * (flip ? -1 : 1);
        const lvy = uvy;

        // 惯性（反方向）
        tx += -lvx * HC.INERTIA;
        ty += -lvy * HC.INERTIA;

        curr.x += (tx - curr.x) * k;
        curr.y += (ty - curr.y) * k;

        // 地面碰撞
        if (curr.y > 20) curr.y = 20;
      }
    }
  }
}

/** 头发管理器 */
export class PetHair {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} scale - 像素放大倍数
   */
  constructor(canvas, scale = 4) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = scale;

    // 画布尺寸
    this.cw = 384;
    this.ch = 384;
    canvas.width = this.cw;
    canvas.height = this.ch;

    this.strands = HC.STRANDS.map((c) => new Strand(c));
  }

  /**
   * 每帧更新 + 绘制
   */
  update(
    dt,
    anchorX,
    anchorY,
    velocity,
    maxSpeed,
    isFlipped,
    rotation,
    timestamp,
  ) {
    const sp = Math.hypot(velocity.x, velocity.y);
    const vn = { x: 0, y: 0 };
    if (sp > 1) {
      const r = Math.min(sp / maxSpeed, 1);
      vn.x = (velocity.x / sp) * r;
      vn.y = (velocity.y / sp) * r;
    }

    this.strands.forEach((s) => {
      s.update(
        anchorX + s.cfg.x0,
        anchorY + s.cfg.y0,
        vn,
        isFlipped,
        rotation,
        timestamp,
      );
    });

    this._draw();
  }

  /** 重绘头发 */
  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cw, this.ch);
    ctx.save();
    ctx.translate(this.cw / 2, this.ch / 2);

    // 先描边（黑色、稍大半径）
    this._batch(ctx, true);
    // 再填充
    this._batch(ctx, false);

    ctx.restore();
  }

  _batch(ctx, outline) {
    const col = outline ? HC.OUTLINE : HC.COLOR;
    const pad = outline ? HC.OUTLINE_PAD : 0;
    const sr = HC.START_R + pad;
    const er = HC.END_R + pad;
    const n = HC.AMOUNT;

    this.strands.forEach((s) => {
      // 画圆
      for (let i = 0; i < n; i++) {
        const r = lerp(sr, er, i / (n - 1));
        ctx.beginPath();
        ctx.arc(s.pts[i].x, s.pts[i].y, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }
      // 画连接体
      for (let i = 1; i < n; i++) {
        this._connector(
          ctx,
          s.pts[i - 1],
          s.pts[i],
          lerp(sr, er, (i - 1) / (n - 1)),
          lerp(sr, er, i / (n - 1)),
          col,
        );
      }
    });
  }

  /** 两圆之间平滑连接（贝塞尔腰身） */
  _connector(ctx, p1, p2, r1, r2, col) {
    const dx = p2.x - p1.x,
      dy = p2.y - p1.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.01) return;

    const a = Math.atan2(dy, dx);
    const c = Math.cos(a + Math.PI / 2);
    const s = Math.sin(a + Math.PI / 2);

    const p1L = { x: p1.x + c * r1, y: p1.y + s * r1 };
    const p1R = { x: p1.x - c * r1, y: p1.y - s * r1 };
    const p2L = { x: p2.x + c * r2, y: p2.y + s * r2 };
    const p2R = { x: p2.x - c * r2, y: p2.y - s * r2 };

    const mx = (p1.x + p2.x) / 2,
      my = (p1.y + p2.y) / 2;
    const mr = (r1 + r2) / 2;

    ctx.beginPath();
    ctx.moveTo(p1L.x, p1L.y);
    ctx.quadraticCurveTo(mx + c * mr * 0.9, my + s * mr * 0.9, p2L.x, p2L.y);
    ctx.lineTo(p2R.x, p2R.y);
    ctx.quadraticCurveTo(mx - c * mr * 0.9, my - s * mr * 0.9, p1R.x, p1R.y);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  }
}
