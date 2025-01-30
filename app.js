App({
  globalData: {

  },
  onCreate(params) {
    params = typeof params === 'string' ? JSON.parse(params) : {}
    this.globalData.params = params
    console.log('app on create invoke')
  },

  onDestroy(options) {
    console.log('app on destroy invoke')
  }
})
