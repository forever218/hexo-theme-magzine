/**
 * tabs.js
 * {% tabs 标签id %}
 * <!-- tab 标签1 -->
 * 内容1
 * <!-- endtab -->
 * 
 * <!-- tab 标签2 -->
 * 内容2
 * <!-- endtab -->
 * {% endtabs %}
 */

'use strict'

function tabs(args, content) {
  const tabId = args[0] || 'tabs_' + Math.random().toString(36).substring(2, 8)
  const tabBlock = content.split(/<!--\s*tab\s+(.*?)\s*-->/).filter(item => item.trim() !== '')

  let tabNav = ''
  let tabContent = ''

  for (let i = 0; i < tabBlock.length; i += 2) {
    const tabTitle = tabBlock[i].trim()
    const tabBody = tabBlock[i + 1] ? tabBlock[i + 1].trim() : ''

    tabNav += `<button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${tabId}-${i}">${tabTitle}</button>`
    tabContent += `<div class="tab-item ${i === 0 ? 'active' : ''}" id="${tabId}-${i}">
      ${hexo.render.renderSync({ text: tabBody, engine: 'markdown' })}
    </div>`
  }

  return `<div class="tabs" id="${tabId}">
    <div class="nav-tabs">${tabNav}</div>
    <div class="tab-content">${tabContent}</div>
  </div>`
}

hexo.extend.tag.register('tabs', tabs, { ends: true })
