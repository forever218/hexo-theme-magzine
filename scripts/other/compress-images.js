/**
 * Hexo Image Compressor (Safe Mode V2)
 * 修复了 public 文件夹不存在时的崩溃问题
 */

const fs = require("fs").promises;
const fsSync = require("fs"); // 引入同步 fs 用于快速检查
const path = require("path");

// === [Added: Safe Load Sharp] ===
// 这一步确保了即使没有 sharp 插件，程序也不会崩溃
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  sharp = null;
}
// ===============================

// === 配置区域 ===
const CONFIG = {
  enable: true,
  ignore: [],
  quality: {
    jpeg: 80,
    png: 80,
    webp: 80,
    avif: 80,
    gif: 80,
  },
  minSize: 10240,
};
// ================

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];

hexo.extend.filter.register("after_generate", async function () {
  if (!CONFIG.enable) return;

  const publicDir = this.public_dir;
  const log = this.log;

  // === [Added: Check Sharp Dependency] ===
  // 如果 sharp 未安装，打印提醒并优雅跳过
  if (!sharp) {
    log.warn(
      "🔔 [Reminder]: 'sharp' module not found. Image optimization skipped.",
    );
    return;
  }
  // ======================================

  // 【修复核心】先检查 public 文件夹是否存在
  // 如果因为前面的报错导致 public 没生成，这里直接跳过，防止报错
  if (!fsSync.existsSync(publicDir)) {
    log.warn(
      "⚠️ [Image Compressor] Public folder not found. Skipping compression.",
    );
    return;
  }

  log.info("🚀 [Image Compressor] Starting image optimization...");

  try {
    const files = await getFiles(publicDir);

    // 过滤出图片文件
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return EXTENSIONS.includes(ext) && !CONFIG.ignore.includes(ext);
    });

    if (imageFiles.length === 0) {
      log.info("✨ [Image Compressor] No images found to process.");
      return;
    }

    let savedSize = 0;
    let successCount = 0;
    let failCount = 0;

    const CONCURRENT_LIMIT = 10;
    for (let i = 0; i < imageFiles.length; i += CONCURRENT_LIMIT) {
      const chunk = imageFiles.slice(i, i + CONCURRENT_LIMIT);
      await Promise.all(
        chunk.map(async (filePath) => {
          try {
            // 二次检查文件是否存在（防止极少数情况下的并发冲突）
            if (!fsSync.existsSync(filePath)) return;

            const ext = path.extname(filePath).toLowerCase();
            const stats = await fs.stat(filePath);
            if (stats.size <= CONFIG.minSize) return;

            const originalBuffer = await fs.readFile(filePath);
            let processedBuffer = null;
            const sharpInstance = sharp(originalBuffer, {
              animated: true,
              limitInputPixels: false,
            });

            if (ext === ".jpg" || ext === ".jpeg") {
              processedBuffer = await sharpInstance
                .jpeg({ quality: CONFIG.quality.jpeg, mozjpeg: true })
                .toBuffer();
            } else if (ext === ".png") {
              processedBuffer = await sharpInstance
                .png({
                  quality: CONFIG.quality.png,
                  compressionLevel: 9,
                  palette: true,
                })
                .toBuffer();
            } else if (ext === ".webp") {
              processedBuffer = await sharpInstance
                .webp({ quality: CONFIG.quality.webp })
                .toBuffer();
            } else if (ext === ".avif") {
              processedBuffer = await sharpInstance
                .avif({ quality: CONFIG.quality.avif })
                .toBuffer();
            } else if (ext === ".gif") {
              try {
                processedBuffer = await sharpInstance
                  .gif({ colours: 128 })
                  .toBuffer();
              } catch (e) {
                return;
              }
            } else {
              return;
            }

            if (
              processedBuffer &&
              processedBuffer.length < originalBuffer.length
            ) {
              await fs.writeFile(filePath, processedBuffer);
              savedSize += originalBuffer.length - processedBuffer.length;
              successCount++;
            }
          } catch (err) {
            failCount++;
            // 降低日志级别，不要打断构建流程
            // log.warn(`Skipped ${path.basename(filePath)}: ${err.message}`);
          }
        }),
      );
    }

    const savedMB = (savedSize / 1024 / 1024).toFixed(2);
    log.info(
      `🎉 [Image Compressor] Finished! Processed ${successCount} images. Saved ${savedMB} MB.`,
    );
  } catch (error) {
    log.error(`⚠️ [Image Compressor] Main loop error: ${error.message}`);
  }
});

async function getFiles(dir) {
  // 增加 try-catch 防止读取中途文件夹被占用
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      }),
    );
    return Array.prototype.concat(...files);
  } catch (e) {
    return [];
  }
}
