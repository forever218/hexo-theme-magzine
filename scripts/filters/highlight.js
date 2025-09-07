/**
 * 代码高亮过滤器
 * 添加复制按钮、语言显示和代码折叠功能
 */

hexo.extend.filter.register('after_post_render', function(data) {
  // 处理代码块
  const theme = hexo.theme.config;

  // 检查是否启用代码高亮
  const highlightEnable = theme.code_block && theme.code_block.highlight;
  if (!highlightEnable) return data;

  // 获取配置
  const highlightCopy = theme.code_block.copy !== false;
  const highlightLang = theme.code_block.lang !== false;
  const highlightShrink = theme.code_block.shrink === true;
  const highlightHeightLimit = theme.code_block.height_limit || 200;

  // 正则表达式匹配代码块
  const codeReg = /<figure class="highlight ([^"]*)">([\s\S]*?)<\/figure>/g;

  data.content = data.content.replace(codeReg, function(match, lang, content) {
    let codeBlock = match;

    // 提取代码内容
    const codeContent = content.match(/<table class="highlight-table">([\s\S]*?)<\/table>/);
    if (!codeContent) return match;

    // 创建工具栏
    let toolsHtml = '<div class="highlight-tools">';

    // 添加折叠按钮
    if (highlightShrink) {
      toolsHtml += '<i class="fas fa-chevron-down expand"></i>';
    }

    // 添加语言显示
    if (highlightLang && lang && lang !== 'plain') {
      toolsHtml += `<span class="code-lang">${lang}</span>`;
    }

    // 添加复制按钮
    if (highlightCopy) {
      toolsHtml += '<span class="copy-notice"></span>';
      toolsHtml += '<i class="fas fa-copy copy-button"></i>';
    }

    toolsHtml += '</div>';

    // 添加高度限制和展开按钮
    let expandBtnHtml = '';
    if (highlightHeightLimit) {
      expandBtnHtml = '<div class="code-expand-btn"><i class="fas fa-angle-double-down"></i></div>';
    }

    // 组装最终的代码块
    codeBlock = '<div class="highlight-wrap">' + toolsHtml + codeContent[0] + expandBtnHtml + '</div>';

    return codeBlock;
  });

  return data;
}, 15);
