/**
 * ============================================
 * 模块6: 角色白色描边 (pet-outline.js)
 * ============================================
 *
 * 使用 CSS filter: drop-shadow 在四个方向（上下左右）
 * 各投射一个 0 模糊、纯白色的阴影，形成均匀的像素风描边。
 *
 * 对应 Godot 项目中 CanvasGroup + screen_outline.gdshader 的效果。
 */

const OC = {
  COLOR: "#ffffff",
  WIDTH: 2, // 描边像素宽度
};

export class PetOutline {
  /**
   * @param {HTMLElement} el - 需要描边的容器 (#pet-inner)
   */
  constructor(el) {
    this.el = el;
    this.width = OC.WIDTH;
    this.color = OC.COLOR;
    this.apply();
  }

  /** 应用四方向 drop-shadow 描边 */
  apply() {
    if (!this.el) return;
    const w = this.width,
      c = this.color;
    this.el.style.filter = [
      `drop-shadow( ${w}px  0     0 ${c})`, // 右
      `drop-shadow(-${w}px  0     0 ${c})`, // 左
      `drop-shadow( 0      ${w}px 0 ${c})`, // 下
      `drop-shadow( 0     -${w}px 0 ${c})`, // 上
    ].join(" ");
  }

  /** 移除描边 */
  remove() {
    if (this.el) this.el.style.filter = "none";
  }

  /** 动态修改宽度 */
  setWidth(w) {
    this.width = w;
    this.apply();
  }

  /** 动态修改颜色 */
  setColor(c) {
    this.color = c;
    this.apply();
  }
}
