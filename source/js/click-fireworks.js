(function () {
  // 1. 初始化 Canvas
  let canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;pointer-events:none;z-index:999999;width:100%;height:100%";
  document.body.appendChild(canvas);
  let ctx = canvas.getContext("2d");

  let particles = [];

  // 全局缓存主题色
  let currentAccentColor = "#ff6b6b";

  // 2. 自动调整画布大小
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // 3. 定义三角形粒子对象
  function createParticle(x, y, color) {
    let size = Math.random() * 8 + 6;
    let angle = Math.random() * Math.PI * 2;
    let velocity = Math.random() * 4 + 2;

    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: 1.0,
      color: color, // 绑定生成时的颜色
    };
  }

  // 4. 动画循环
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.rotation += p.rotationSpeed;
      p.life -= 0.015;

      if (p.life <= 0) {
        particles.splice(i, 1);
        i--;
        continue;
      }

      // --- 绘制三角形 ---
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // 直接使用绑定好的颜色
      ctx.globalAlpha = p.life > 0 ? p.life : 0;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.866, p.size * 0.5);
      ctx.lineTo(-p.size * 0.866, p.size * 0.5);
      ctx.closePath();

      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  // 启动动画
  loop();

  // 5. 绑定点击事件
  document.addEventListener("mousedown", function (e) {
    // 每次点击时查询并更新颜色，绝对不在高频的 requestAnimationFrame 循环里查！
    currentAccentColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim() || "#ff6b6b";

    // 每次点击生成 15 个粒子
    for (let i = 0; i < 15; i++) {
      particles.push(createParticle(e.clientX, e.clientY, currentAccentColor));
    }
  });
})();
