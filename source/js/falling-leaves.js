(function () {
  // --- 0. 移动端禁用检测 ---
  // 如果屏幕宽度小于 768px (通常是手机/平板)，直接退出，不运行脚本
  if (window.innerWidth <= 768) {
    return;
  }

  // 也可以通过 userAgent 进一步检测 (双重保险)
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    return;
  }

  // --- 1. 初始化全屏 Canvas ---
  let canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;pointer-events:none;z-index:999999;width:100%;height:100%";
  document.body.appendChild(canvas);
  let ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;
  let leaves = [];

  // --- 2. 窗口大小调整监听 ---
  window.addEventListener("resize", function () {
    // 如果调整窗口后变窄了（变成手机模式），则清空画布并不再绘制
    if (window.innerWidth <= 768) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
  canvas.width = width;
  canvas.height = height;

  // --- 3. 核心数据：精准枫叶坐标 (原始数据 0-100) ---
  const maplePoints = [
    [50, 0], // 0. 顶部主尖端 (Top)
    [56, 18], // 1. 顶叶右内凹
    [64, 13], // 2. 顶叶右尖端
    [59, 35], // 3. 右侧上深凹口
    [84, 20], // 4. 右叶顶部尖端
    [78, 34], // 5. 右叶上方内凹
    [98, 40], // 6. 右叶最右侧尖端 (Right Most)
    [80, 52], // 7. 右叶下方内凹
    [86, 70], // 8. 右叶底部尖端
    [54, 68], // 9. 右侧叶底与叶柄交界
    [54, 100], // 10. 叶柄右下角 (Bottom Right Stem)
    [46, 100], // 11. 叶柄左下角 (Bottom Left Stem)
    [46, 68], // 12. 左侧叶底与叶柄交界
    [14, 70], // 13. 左叶底部尖端
    [20, 52], // 14. 左叶下方内凹
    [2, 40], // 15. 左叶最左侧尖端 (Left Most)
    [22, 34], // 16. 左叶上方内凹
    [16, 20], // 17. 左叶顶部尖端
    [41, 35], // 18. 左侧上深凹口
    [36, 13], // 19. 顶叶左尖端
    [44, 18], // 20. 顶叶左内凹
  ];

  // --- 4. 叶子类 ---
  function Leaf() {
    this.init();
  }

  Leaf.prototype.init = function (resetY = false) {
    this.x = Math.random() * width;
    // resetY为true表示是循环生成的，从顶部开始；否则是初始化，随机分布
    this.y = resetY ? -100 : Math.random() * height;

    // 大小缩放系数：0.2 ~ 0.5 (原始数据是100px宽，缩放后大概是 20px~50px)
    this.scale = Math.random() * 0.3 + 0.2;

    // 下落速度
    this.speed = Math.random() * 1.0 + 0.5;

    // 摇摆参数
    this.swayAmplitude = Math.random() * 1.0 + 0.5;
    this.swaySpeed = Math.random() * 0.02 + 0.005;
    this.swayPhase = Math.random() * Math.PI * 2;

    // 旋转参数
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;

    // 透明度
    this.opacity = Math.random() * 0.4 + 0.5;
  };

  Leaf.prototype.update = function () {
    this.y += this.speed;

    // 左右摇摆
    this.swayPhase += this.swaySpeed;
    this.x += Math.sin(this.swayPhase) * this.swayAmplitude;

    // 旋转
    this.rotation += this.rotationSpeed;

    // 循环：落到底部后重置到顶部
    if (this.y > height + 100) {
      this.init(true);
    }
  };

  Leaf.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale); // 应用缩放
    ctx.globalAlpha = this.opacity;

    // 颜色：粉红色 rgb(255, 107, 107)
    ctx.fillStyle = "rgb(255, 107, 107)";

    ctx.beginPath();

    // 原始数据中心点大约在 (50, 50)，我们需要将其偏移到 (0,0) 以便旋转
    // x偏移 -50, y偏移 -50
    let offsetX = 50;
    let offsetY = 50;

    maplePoints.forEach(function (point, i) {
      let px = point[0] - offsetX;
      let py = point[1] - offsetY;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // --- 5. 生成叶子数量 ---
  let leafCount = 4; // 【修改点】屏幕上最多只会有 4 片叶子
  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf());
  }

  // --- 6. 动画循环 ---
  function loop() {
    // 如果是小屏幕，停止渲染
    if (window.innerWidth <= 768) return;

    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < leaves.length; i++) {
      leaves[i].update();
      leaves[i].draw();
    }
  }
  loop();
})();
