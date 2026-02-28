(function () {
  // 1. 初始化 Canvas
  let canvas = document.createElement("canvas");
  // 关键：pointer-events: none 让鼠标事件穿透 Canvas，不影响网页操作
  canvas.style.cssText =
    "position:fixed;top:0;left:0;pointer-events:none;z-index:999999;width:100%;height:100%";
  document.body.appendChild(canvas);
  let ctx = canvas.getContext("2d");

  let particles = [];

  // 2. 自动调整画布大小
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas(); // 初始化时先执行一次

  // 3. 定义三角形粒子对象
  function createParticle(x, y) {
    let size = Math.random() * 8 + 6; // 大小：6px ~ 14px (比之前大一点点)

    // 随机方向和速度
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
      life: 1.0, // 生命值 1.0 -> 0
      // 颜色: RGB(255, 107, 107)
      color: "255, 107, 107",
    };
  }

  // 4. 动画循环
  function loop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 遍历所有粒子
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];

      // 更新位置
      p.x += p.vx;
      p.y += p.vy;

      // 增加一点重力（向下掉）和摩擦力（减速）
      p.vy += 0.05;
      p.vx *= 0.96;
      p.vy *= 0.96;

      // 更新旋转和生命值
      p.rotation += p.rotationSpeed;
      p.life -= 0.015; // 消失速度

      // 如果生命值耗尽，移除粒子
      if (p.life <= 0) {
        particles.splice(i, 1);
        i--;
        continue; // 跳过后续绘制
      }

      // --- 绘制三角形 ---
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = "rgba(" + p.color + "," + p.life + ")";

      ctx.beginPath();
      // 等边三角形绘制路径
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
    // 每次点击生成 15 个粒子
    for (let i = 0; i < 15; i++) {
      particles.push(createParticle(e.clientX, e.clientY));
    }
  });
})();
