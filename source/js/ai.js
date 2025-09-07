

          // AI构造函数
          new ChucklePostAI({
            /* 必须配置 */
            // 文章内容所在的元素属性的选择器，也是AI挂载的容器，AI将会挂载到该容器的最前面
            el: '#post>#article-container',
            // 驱动AI所必须的key，即是tianliGPT后端服务所必须的key
              key:'',
            /* 非必须配置 */
            // 文章标题所在的元素属性的选择器，默认获取当前网页的标题
            title_el: '.post-title',
            // 文章推荐方式，all：匹配数据库内所有文章进行推荐，web：仅当前站内的文章，默认all
            rec_method: 'web',
            // 获取文章内容时，需要排除的元素及其子元素，默认如下
            exclude: ['highlight', 'Copyright-Notice', 'post-ai', 'post-series', 'mini-sandbox']
          })
