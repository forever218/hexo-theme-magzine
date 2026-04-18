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
    [64, 13], // 2. 顶叶��尖端
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

  // ★★★ 关键优化：只计算一次路径并缓存，不用每帧重复算 ★★★
  const leafPath = new Path2D();
  const offsetX = 50;
  const offsetY = 50;
  maplePoints.forEach(function (point, i) {
    let px = point[0] - offsetX;
    let py = point[1] - offsetY;
    if (i === 0) leafPath.moveTo(px, py);
    else leafPath.lineTo(px, py);
  });
  leafPath.closePath();

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

  // ★★★ 关键修改 1：引入 timeScale 参数，将动画与真实时间挂钩 ★★★
  Leaf.prototype.update = function (timeScale = 1) {
    // 所有的速度都要乘以时间比例。如果掉帧导致这一帧经历的时间变长，它就会单步走得更远，从而保证视觉上永远是匀速的
    this.y += this.speed * timeScale;

    // 左右摇摆
    this.swayPhase += this.swaySpeed * timeScale;
    this.x += Math.sin(this.swayPhase) * this.swayAmplitude;

    // 旋转
    this.rotation += this.rotationSpeed * timeScale;

    // 循环：落到底部后重置到顶部
    if (this.y > height + 100) {
      this.init(true);
    }
  };

  Leaf.prototype.draw = function () {
    // 获取全局主题色（如果没有获取到，降级为黑色）
    let accentColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim() || "#ff6b6b";

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.opacity;

    // 将原本的 "rgb(255, 107, 107)" 替换掉
    ctx.fillStyle = accentColor;

    ctx.fill(leafPath);
    ctx.restore();
  };

  // --- 5. 生成叶子数量 ---
  let leafCount = 4; // 屏幕上最多只会有 4 片叶子
  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf());
  }

  // --- 6. 动画循环 ---
  let lastTime = 0; // 新增：记录上一帧的时间戳

  // 接收 requestAnimationFrame 传进来的 timestamp
  function loop(timestamp) {
    // 如果是小屏幕，停止渲染
    if (window.innerWidth <= 768) return;

    requestAnimationFrame(loop);

    // ★★★ 关键修改 2：计算两帧之间的时间差 (Delta Time) ★★★
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 防止用户切后台或者 Edge 强行睡眠休眠，切回来的时候由于时间差巨大导致叶子瞬间乱飞。超过 50ms 强制当作正常刷新处理
    if (deltaTime > 50) deltaTime = 16.66;

    // 以 60FPS (1000ms / 60 ≈ 16.66ms) 为基准算出时间比例。
    // 如果 Edge 把帧率强降到 30 帧 (约 33.3ms)，timeScale 就会变成 2，叶子每次步长翻倍，肉眼还是匀速！
    let timeScale = deltaTime / 16.66;

    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < leaves.length; i++) {
      leaves[i].update(timeScale); // 传入算好的时间比例
      leaves[i].draw();
    }
  }

  // 第一次调用不要直接 loop()，必须通过 requestAnimationFrame(loop) 才能给函数注入精确的时间戳 (timestamp)
  requestAnimationFrame(loop);
})();
