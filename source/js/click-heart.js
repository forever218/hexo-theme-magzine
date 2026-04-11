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

  // 全局缓存主题色，避免性能问题
  let currentAccentColor = "#ff6b6b";

  // 平假名列表
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
    "❤",
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
  function Particle(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color; // 保存生成时的颜色

    // 50% 概率是爱心形状，50% 概率是平假名文字
    this.isHeartShape = Math.random() < 0.5;

    if (this.isHeartShape) {
      this.size = Math.random() * 10 + 5;
    } else {
      this.text = hiragana[Math.floor(Math.random() * hiragana.length)];
      this.size = Math.random() * 14 + 10;
    }

    let angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 3 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.life = 100;
    this.alpha = 1;
    this.gravity = 0.05;
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life--;
    this.alpha = this.life / 100;
  };

  Particle.prototype.draw = function () {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color; // 使用生成时的缓存颜色

    if (this.isHeartShape) {
      ctx.beginPath();
      let topCurveHeight = this.size * 0.3;
      ctx.moveTo(this.x, this.y + topCurveHeight);
      ctx.bezierCurveTo(
        this.x,
        this.y,
        this.x - this.size / 2,
        this.y,
        this.x - this.size / 2,
        this.y + topCurveHeight,
      );
      ctx.bezierCurveTo(
        this.x - this.size / 2,
        this.y + (this.size + topCurveHeight) / 2,
        this.x,
        this.y + (this.size + topCurveHeight) / 2,
        this.x,
        this.y + this.size,
      );
      ctx.bezierCurveTo(
        this.x,
        this.y + (this.size + topCurveHeight) / 2,
        this.x + this.size / 2,
        this.y + (this.size + topCurveHeight) / 2,
        this.x + this.size / 2,
        this.y + topCurveHeight,
      );
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
      ctx.font = "bold " + this.size + "px 'Microsoft YaHei', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.text, this.x, this.y);
    }
  };

  // 4. 动画循环
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.update();
      p.draw();
      if (p.life <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
  }
  loop();

  // 5. 点击监听
  document.addEventListener("mousedown", function (e) {
    // 每次点击时，获取一次最新的主题色
    currentAccentColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim() || "#ff6b6b";

    let count = 12;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(e.clientX, e.clientY, currentAccentColor));
    }
  });
})();
