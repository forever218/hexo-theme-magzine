





/**
 * hideInline.js
 * transplant from anzhiyv theme
 * Implement inline hide content functionality
 */

'use strict'

function postHideInline(args) {
  // 将所有参数合并为一个字符串，然后按逗号分割
  const fullArg = args.join(' ');
  const params = fullArg.split(',').map(param => param.trim());

  if (params.length < 1) {
    throw new Error('hideInline tag requires at least 1 parameter: content');
  }

  const content = params[0];
  let displayText, bgColor, textColor;

  if (params.length >= 4) {
    // 新格式: content,display,bg,color
    displayText = params[1];
    bgColor = params[2];
    textColor = params[3];
  } else {
    // 旧格式或参数不足，使用默认值
    displayText = '点击查看隐藏内容';
    bgColor = '#FF7242';
    textColor = '#fff';
  }

  return `<span class="hide-inline" 
                data-hidden-content="${content}" 
                data-display-text="${displayText}"
                style="background-color: ${bgColor}; color: ${textColor};">${displayText}</span>`
}

hexo.extend.tag.register('hideInline', postHideInline)





