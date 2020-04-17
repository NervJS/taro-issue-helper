const path = require('path')
const merge = require('deepmerge')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/taro-issue-helper/'
    : '/',
  configureWebpack: {
    resolve: {
      symlinks: false
    }
  },

  chainWebpack: config => {
    config.module
      .rule('md')
      .test(/\.md$/)
        .use('raw-loader')
        .loader('raw-loader')

    config.module.rule('stylus').oneOf('vue').use('postcss-loader')
      .tap(options =>
        merge(options, {
          config: {
            path: path.resolve(__dirname, '.postcssrc')
          }
        })
      )
  }
}
