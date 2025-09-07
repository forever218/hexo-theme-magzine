
/**
 * label.js
 * transplant from anzhiyv theme
 * Implement label functionality
 */

'use strict'

function postLabel(args) {
  const text = args[0] || ''
  const color = args[1] || ''

  // 支持的颜色映射
  const colorMap = {
    'default': 'var(--primary-color)',
    'primary': 'var(--primary-color)',
    'success': '#52c41a',
    'info': '#1890ff',
    'warning': '#faad14',
    'danger': '#ff4d4f',
    'important': '#722ed1'
  }

  // 获取颜色值，如果不在映射中则直接使用传入的颜色值
  const bgColor = colorMap[color] || color || colorMap.default

  return `<span class="label" style="background-color: ${bgColor}">${text}</span>`
}

hexo.extend.tag.register('label', postLabel)
