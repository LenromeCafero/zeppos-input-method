import { SetPage,  SetTool, SetItemMaker } from '../../../../CubeTimer/shared/setlist'
import { InputMethod } from '../../../utils/inputMethod/inputMethod'
import { KeyBoardLib } from '../../../utils/keyboard'
import { TEXT_STYLE } from './index.style'
import { gettext } from 'i18n'

const logger = DeviceRuntimeCore.HmLogger.getLogger('helloworld')
Page({
  build() {
    let pages = {
      //主界面 
      pageMain: SetPage.shellCreate({
        "name": "main",
        "items": [
          { //标题
            "name": "head",
            "type": SetItemMaker.Types.TEXT,
            "style": SetItemMaker.Styles.HEAD,
            "data": {
              "text": gettext('settingTitle')
            }
          },
          { //计时器设置
            "name": "timer",
            "type": SetItemMaker.Types.TEXT | SetItemMaker.Types.ARROW,
            "style": SetItemMaker.Styles.BODY,
            "data": {
              "text": { "text": gettext('setMainTimer') },
              "arrow": {
                click_func(item) {
                  item.getParentPage().getParentTool().gotoPageByName("timer")
                }
              }
            }
          },
          { //重置按钮
            "name": "resetData",
            "type": SetItemMaker.Types.BUTTON,
            "style": SetItemMaker.Styles.BODY,
            "data": {
              "button": {
                "text": gettext("setResetDataText"),
                "color": 0xff3333,
                "normal_color": 0x222222,
                "press_color": 0x333333,
                "text_size": px(35),
                click_func: (button) => {
                  if (!resetYes) {
                    hmUI.showToast({
                      "text": gettext("setMainResetToast")
                    })
                    resetYes = true
                  }
                  else {
                    data.reset()
                    hmUI.showToast({
                      "text": gettext("setMainResetDoneToast")
                    })
                    resetYes = false
                    //unlinkSync(file)
                    //hmApp.exit()
                  }
                  // 
                  // 
                }
              }
            }
          }
        ]
      })
    }
    logger.debug('start setTool')
    //设置总控
    let setTool = new SetTool({
      pageArray: [
        pages.pageMain,
      ],
      mainPageInstance: null,//若指定初始界面则跳转，否则进入主界面
      onExit_func() {
        console.log("!onExit callback test successed!")
      }
    })

    setTool.start()
    // logger.debug('page build invoked')
    // let inputMethod = new InputMethod({
    //   keyboard_list: [0],
    //   inputbox_type: [0],
    //   max_byte: 50,
    //   text: "",
    //   title: "输入法"
    // })
    // inputMethod.start()
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
    // hmApp.registerGestureEvent(function (event) {
    //   let msg = 'none'
    //   switch (event) {
    //     case hmApp.gesture.UP:
    //       msg = 'up'
    //       break
    //     case hmApp.gesture.DOWN:
    //       msg = 'down'
    //       break
    //     case hmApp.gesture.LEFT:
    //       msg = 'left'
    //       break
    //     case hmApp.gesture.RIGHT:
    //       msg = 'right'
    //       break
    //     default:
    //       break
    //   }
    //   console.log(`receive gesture event ${msg}`)

    //   跳过默认手势
    //   return true
    // })
  },
  onInit() {
    logger.debug('page onInit invoked')
  },

  onDestroy() {
    logger.debug('page onDestroy invoked')
  },
})