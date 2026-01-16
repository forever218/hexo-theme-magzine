/**
 * Universal video embed tag for Hexo
 * Usage:
 * {% video VIDEO_URL %}
 */

hexo.extend.tag.register('video', function (args) {
  const url = args[0];
  if (!url) return '';

  let src = '';
  let isVertical = false; // 是否是竖屏视频（用于调整比例）
  let isTwitter = false;  // 推特特殊处理

  // ==================== 中国国内平台 ====================

  // ---------- 哔哩哔哩 (Bilibili) ----------
  if (url.includes('bilibili.com')) {
    const m = url.match(/BV([a-zA-Z0-9]+)/);
    if (m) {
      src = `//player.bilibili.com/player.html?bvid=BV${m[1]}&page=1&autoplay=0&high_quality=1&danmaku=0`;
    }
  }

  // ---------- AcFun (A站) ----------
  else if (url.includes('acfun.cn')) {
    const m = url.match(/ac=(\d+)/) || url.match(/ac(\d+)/);
    if (m) {
      src = `https://www.acfun.cn/player/ac${m[1]}`;
    }
  }

  // ---------- 西瓜视频 (Xigua) ----------
  else if (url.includes('ixigua.com')) {
    // 匹配 URL 中的长数字 ID
    const m = url.match(/\/(\d+)\/?/); 
    if (m) {
      src = `https://www.ixigua.com/iframe/${m[1]}?autoplay=0`;
    }
  }

  // ---------- 虎牙直播 (Huya) ----------
  else if (url.includes('huya.com')) {
    const m = url.match(/huya\.com\/(\d+)/) || url.match(/huya\.com\/([a-zA-Z0-9]+)/);
    if (m) {
      src = `https://liveshare.huya.com/iframe/${m[1]}`;
    }
  }

  // ==================== 国际/国外平台 ====================

  // ---------- YouTube (支持普通视频和 Shorts) ----------
  else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('shorts/')) {
      const m = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
      if (m) videoId = m[1];
      isVertical = true; // Shorts 是竖屏
    } else if (url.includes('v=')) {
      const m = url.match(/v=([a-zA-Z0-9_-]+)/);
      if (m) videoId = m[1];
    } else if (url.includes('youtu.be/')) {
      const m = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (m) videoId = m[1];
    }

    if (videoId) {
      src = `https://www.youtube.com/embed/${videoId}?autoplay=0`;
    }
  }

  // ---------- Twitter / X ----------
  // 推特官方不再支持简单的 iframe，这里使用 Twitframe 第三方服务进行转发
  else if (url.includes('twitter.com') || url.includes('x.com')) {
    isTwitter = true; // 推特高度可能会变，特殊处理
    src = `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
  }

  // ---------- TikTok (国际版抖音) ----------
  else if (url.includes('tiktok.com')) {
    const m = url.match(/video\/(\d+)/);
    if (m) {
      src = `https://www.tiktok.com/embed/v2/${m[1]}`;
      isVertical = true;
    }
  }

  // ---------- Instagram ----------
  else if (url.includes('instagram.com')) {
    // 移除参数，确保以 /embed 结尾
    let cleanUrl = url.split('?')[0].replace(/\/$/, "");
    src = `${cleanUrl}/embed/`;
    isVertical = true; 
  }

  // ---------- Twitch (直播和录像) ----------
  // 【重要】Twitch 要求必须指定 parent 参数为你的博客域名
  // 请将下方的 &parent=localhost 修改为你的实际域名，例如 &parent=yourblog.com
  else if (url.includes('twitch.tv')) {
    let videoId = '';
    let channel = '';
    
    if (url.includes('/videos/')) {
       const m = url.match(/videos\/(\d+)/);
       if (m) videoId = m[1];
       src = `https://player.twitch.tv/?video=${videoId}&parent=localhost&autoplay=false`;
    } else {
       const m = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
       if (m) channel = m[1];
       src = `https://player.twitch.tv/?channel=${channel}&parent=localhost&autoplay=false`;
    }
  }

  // ---------- Facebook ----------
  else if (url.includes('facebook.com') || url.includes('fb.watch')) {
    src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
  }

  // ---------- Vimeo ----------
  else if (url.includes('vimeo.com')) {
    const m = url.match(/vimeo\.com\/(\d+)/);
    if (m) src = `https://player.vimeo.com/video/${m[1]}`;
  }

  // ---------- Niconico ----------
  else if (url.includes('nicovideo.jp')) {
    const m = url.match(/watch\/(sm\d+|so\d+)/); // 匹配 sm 或 so 开头的 ID
    if (m) src = `https://embed.nicovideo.jp/watch/${m[1]}`;
  }


  // ==================== 输出 HTML ====================

  if (!src) {
    return `<p style="color:#888;font-size:12px;text-align:center;">[不支持的视频链接: ${url}] <br> 建议直接粘贴该平台的嵌入代码 (iframe)</p>`;
  }

  // 样式调整
  // 竖屏视频 (Tiktok/Shorts/Ins) 比例设为 9:16 (padding-bottom: 177%)
  // 推特通常比较方，或者内容不固定，给一个中间值
  // 普通视频设为 16:9 (padding-bottom: 56.25%)
  
  let paddingBottom = '56.25%'; 
  let maxWidth = '100%';
  let margin = '0';

  if (isVertical) {
    paddingBottom = '177.77%'; // 9:16
    maxWidth = '350px';        // 限制宽度，不然电脑上看太大了
    margin = '0 auto';         // 居中
  } else if (isTwitter) {
    paddingBottom = '100%';    // 推特高度不固定，先给正方形空间
    maxWidth = '500px';
    margin = '0 auto';
  }

  return `
<div style="position: relative; width: 100%; max-width: ${maxWidth}; margin: ${margin}; padding-bottom: ${paddingBottom}; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <iframe
    src="${src}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allowfullscreen
    scrolling="no"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
  </iframe>
</div>
`;
});