(function () {
  // 1. 初始化 Canvas
  let canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;pointer-events:none;z-index:99999999;";
  document.body.appendChild(canvas);
  let ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];

  // 平假名列表 (你可以自己添加喜欢的字符)
  let hiragana = [
    "あ",
    "い",
    "う",
    "え",
    "お",
    "か",
    "き",
    "く",
    "け",
    "こ",
    "さ",
    "し",
    "す",
    "せ",
    "そ",
    "た",
    "ち",
    "つ",
    "て",
    "と",
    "な",
    "に",
    "ぬ",
    "ね",
    "の",
    "は",
    "ひ",
    "ふ",
    "へ",
    "ほ",
    "ま",
    "み",
    "む",
    "め",
    "も",
    "や",
    "ゆ",
    "よ",
    "ら",
    "り",
    "る",
    "れ",
    "ろ",
    "わ",
    "を",
    "ん",
    "❤", // 偶尔也直接出个心形字符
  ];

  // 2. 窗口大小调整
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener("resize", resize);
  resize();

  // 3. 粒子类
  function Particle(x, y) {
    this.x = x;
    this.y = y;

    // 50% 概率是爱心形状，50% 概率是平假名文字
    this.isHeartShape = Math.random() < 0.5;

    if (this.isHeartShape) {
      this.size = Math.random() * 10 + 5; // 爱心大小
    } else {
      // 随机取一个平假名
      this.text = hiragana[Math.floor(Math.random() * hiragana.length)];
      this.size = Math.random() * 14 + 10; // 文字大小
    }

    // 随机散开的速度和方向
    let angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 3 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.life = 100; // 存活时间
    this.alpha = 1; // 透明度
    this.gravity = 0.05; // 重力
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity; // 加上重力，会有下落感
    this.life--; // 减少寿命
    this.alpha = this.life / 100; // 透明度随寿命递减
  };

  Particle.prototype.draw = function () {
    ctx.globalAlpha = this.alpha;
    // 颜色锁定为粉红色 rgb(255, 107, 107)
    ctx.fillStyle = "rgb(255, 107, 107)";

    if (this.isHeartShape) {
      // --- 绘制爱心形状 (贝塞尔曲线) ---
      ctx.beginPath();
      // 这里是画爱心的数学逻辑，不用深究，直接用就好
      let topCurveHeight = this.size * 0.3;
      ctx.moveTo(this.x, this.y + topCurveHeight);
      // 左上曲线
      ctx.bezierCurveTo(
        this.x,
        this.y,
        this.x - this.size / 2,
        this.y,
        this.x - this.size / 2,
        this.y + topCurveHeight,
      );
      // 左下曲线
      ctx.bezierCurveTo(
        this.x - this.size / 2,
        this.y + (this.size + topCurveHeight) / 2,
        this.x,
        this.y + (this.size + topCurveHeight) / 2,
        this.x,
        this.y + this.size,
      );
      // 右下曲线
      ctx.bezierCurveTo(
        this.x,
        this.y + (this.size + topCurveHeight) / 2,
        this.x + this.size / 2,
        this.y + (this.size + topCurveHeight) / 2,
        this.x + this.size / 2,
        this.y + topCurveHeight,
      );
      // 右上曲线
      ctx.bezierCurveTo(
        this.x + this.size / 2,
        this.y,
        this.x,
        this.y,
        this.x,
        this.y + topCurveHeight,
      );
      ctx.closePath();
      ctx.fill();
    } else {
      // --- 绘制文字 (平假名) ---
      // 使用 Comic Sans MS 或系统默认字体，看起来比较可爱
      ctx.font = "bold " + this.size + "px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.text, this.x, this.y);
    }
  };

  // 4. 动画循环
  function loop() {
    requestAnimationFrame(loop);
    // 每一帧清空画布，防止重叠
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.update();
      p.draw();
      // 如果寿命没了，就移除
      if (p.life <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
  }
  loop();

  // 5. 点击监听
  document.addEventListener("mousedown", function (e) {
    let count = 12; // 每次点击蹦出多少个 (建议 10-15 个)
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(e.clientX, e.clientY));
    }
  });
})();
