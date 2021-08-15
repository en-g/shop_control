module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'src': '@',
        'assets': '@/assets',
        'components': '@/components'
      }
    }
  }
}