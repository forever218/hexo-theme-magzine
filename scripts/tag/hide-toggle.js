
/**
 * hideToggle.js
 * transplant from anzhiyv theme
 * Implement toggle hide content functionality
 */

'use strict'

function postHideToggle(args, content) {
  const title = args.join(' ')
  return `<div class="hide-toggle">
    <div class="hide-toggle-title">${title}</div>
    <div class="hide-toggle-content">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>
  </div>`
}

hexo.extend.tag.register('hideToggle', postHideToggle, { ends: true })
