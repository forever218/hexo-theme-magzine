/**
 * folding.js
 * {% folding 参数, 标题 %}
 * 内容
 * {% endfolding %}
 */

'use strict'

function folding(args, content) {
  let params = args.join(' ').split(',')
  let color = params[0] || ''
  let title = params[1] || '点击展开/折叠'

  return `<details class="folding-wrapper" ${color ? 'style="border-color: ' + color + ';"' : ''}>
  <summary class="folding-title">${title}</summary>
  <div class="folding-content">
    ${hexo.render.renderSync({ text: content, engine: 'markdown' })}
  </div>
</details>`
}

hexo.extend.tag.register('folding', folding, { ends: true })
