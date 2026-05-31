/* global hexo */

'use strict';

const pagination = require('hexo-pagination');

// 覆盖默认的 index generator，添加 sticky 置顶支持
hexo.extend.generator.register('index', function(locals) {
  const config = this.config;
  const indexConfig = config.index_generator || {};

  // 1. 先按配置的 order_by 排序（默认 -date）
  const posts = locals.posts.sort(indexConfig.order_by || '-date');

  // 2. 再按 sticky 值排序，sticky 越大越靠前
  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  const paginationDir = indexConfig.pagination_dir || config.pagination_dir || 'page';
  const path = indexConfig.path || '';

  return pagination(path, posts, {
    perPage: indexConfig.per_page,
    layout: indexConfig.layout || ['index', 'archive'],
    format: paginationDir + '//%d/',
    data: {
      __index: true
    }
  });
});
