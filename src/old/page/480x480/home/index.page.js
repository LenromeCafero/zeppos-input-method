import { Fx } from '../../../utils/fx'
import { InputMethod } from '../../../utils/inputMethod/inputMethod'

const logger = DeviceRuntimeCore.HmLogger.getLogger('helloworld')
var inputMethod = null
Page({
  build() {
    logger.debug('page build invoked')
    inputMethod = new InputMethod({
      keyboard_list: [0],
      inputbox_type: [0],
      max_byte: 50,
      text: "",
      title: "输入法"
    })
    inputMethod.start()
    // hmUI.createWidget(hmUI.widget.ARC, {
    //   x: 0,
    //   y: 0,
    //   w: px(480),
    //   h: px(480),
    //   start_angle: 0,
    //   end_angle: 359,
    //   line_width: 2,
    //   color: 0xffffff
    // })
    // hmUI.createWidget(hmUI.widget.IMG, {
    //   x:0,y:0,w:px(480),h:px(480),src:"image/roundMark.png"
    // })

    // new Fx({
    //   delay: 500,
    //   begin: 0,
    //   end: 500,
    //   style: Fx.Styles.EASE_OUT_QUAD,
    //   fps: 120,
    //   time:3,
    //   func: res => inputMethod.inputbox.textLine.setLocX(res),
    //   onStop() {logger.debug('fx done!')}
    // })
    //注册手势监听 一个 JsApp 重复注册会导致上一个注册的回调失效
    hmApp.registerGestureEvent(function (event) {
      let msg = 'none'
      switch (event) {
        case hmApp.gesture.UP:
          msg = 'up'
          break
        case hmApp.gesture.DOWN:
          msg = 'down'
          break
        case hmApp.gesture.LEFT:
          msg = 'left'
          break
        case hmApp.gesture.RIGHT:
          msg = 'right'
          break
        default:
          break
      }
      console.log(`receive gesture event ${msg}`)

      //跳过默认手势
      return true
    })
  },
  onInit() {
    logger.debug('page onInit invoked')
  },

  onDestroy() {
    // 取消注册手势监听
    hmApp.unregisterGestureEvent()
    logger.debug('page onDestroy invoked')
    inputMethod.delete()
  },
})