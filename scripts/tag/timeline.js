
/**
 * timeline.js
 * transplant from anzhiyv theme
 * Implement timeline functionality
 */

'use strict'

function postTimeline(args, content) {
  const title = args.join(' ')
  return `<div class="timeline">
    ${title ? `<h2 class="timeline-title">${title}</h2>` : ''}
    <div class="timeline-body">
      ${hexo.render.renderSync({ text: content, engine: 'markdown' })}
    </div>
  </div>`
}

function postTimelineItem(args, content) {
  const title = args[0] || ''
  const time = args[1] || ''
  const icon = args[2] || ''

  return `<div class="timeline-item">
    <div class="timeline-item-left">
      ${icon ? `<i class="${icon}"></i>` : '<div class="timeline-item-dot"></div>'}
    </div>
    <div class="timeline-item-right">
      ${time ? `<div class="timeline-item-time">${time}</div>` : ''}
      <div class="timeline-item-title">${title}</div>
      <div class="timeline-item-content">
        ${hexo.render.renderSync({ text: content, engine: 'markdown' })}
      </div>
    </div>
  </div>`
}

hexo.extend.tag.register('timeline', postTimeline, { ends: true })
hexo.extend.tag.register('timenode', postTimelineItem, { ends: true })
