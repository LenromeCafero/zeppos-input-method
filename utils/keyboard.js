/*
* Created:  CuberQAQ
* Date:     2022/10/2
* Describe: A JS class for Input Method
*/

//import { data } from "./data"
import { Fx } from "./fx"
const logger = DeviceRuntimeCore.HmLogger.getLogger('keyboard.js')
// const vibrate = hmSensor.createSensor(hmSensor.id.VIBRATE)

function click() {
  // vibrate.stop()
  // vibrate.scene = 25
  // vibrate.start()
}

// DEVICE_SHAPE: [0]方屏 | [1]圆屏
export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT, screenShape: DEVICE_SHAPE } = hmSetting.getDeviceInfo()
const data = {
  json: {
    "keyboardList": [
      0, 1, 2
    ],
    "from": {
      "appid": 0,
      "url": "",
      "param": "{}", //传参，提供给调用源作为补充，会一模一样返回去
    },
    "theme": {
      "functionBar": {
        "color": 0xffffff
      },
      "background": {
        "color": 0xdddddd
      },
      "button": {
        "color": 0xffffff,
        "radius": 6,
        "distance_v": 6, // 行之间距离
        "distance_h": 6,//列之间距离 
        "press_color": 0xee6666,
      }
    },
    "longPressTicks": 5
  }
}

export const KEYBOARD_TYPE = {
  EN: 0,
  NUM: 1,
  ZH_CN_PY: 2,
}
export const INPUTBOX_TYPE = {
  NORMAL: 0,
  PASSWORD: 1,
}
export const LINK_EVENT_TYPE = {
  FINISH: 1,
  INPUT: 2,
  DELETE: 3,
  CHANGE: 4
}
const BOUNDARY_Y = DEVICE_SHAPE ? px(190) : px(190) // InputBox和Keyboard分界线y坐标
const FUNCTION_BAR_H = DEVICE_SHAPE ? px(50) : px(50) // 预留给选词和工具区域的高度
// InputMethod 输入法类
// 包含一个InputBox实例和一个Keyboard可选列表，通过一个control面板将触控事件分发给两个实例
export class InputMethod {
  constructor({ keyboard_list, inputbox_type, max_byte }) {
    if (keyboard_list == undefined) { this.keyboard_list = data.json.keyboardList }
    else { this.keyboard_list = keyboard_list }
    if (!this.keyboard_list.length) { logger.debug("keyboard.js: ERROR empty keyboard_list"); return }
    this.singleKeyboard = this.keyboard_list.length == 1
    this.nowKeyboardType = this.keyboard_list[0]
    if (this.nowKeyboardType >= KeyBoardLib.length) { logger.debug("keyboard.js: ERROR keyboard_type overflow"); return }
    this.keyboard = new (KeyBoardLib[this.nowKeyboardType])({ singleKeyboard: this.singleKeyboard, father: this })
    this.inputboxType = inputbox_type
    if (this.inputboxType >= InputBoxLib.length) { logger.debug("keyboard.js: ERROR inputbox_type overflow"); return }
    //TODO this.inputbox = new InputBoxLib[this.inputboxType]({test:666}) //TODO
    this.inputbox = new InputBoxLib[0]({ test: 1, father: this })
    this.controlPlane = null
    this.controlCallBack = [
      (info) => { logger.debug("callback:CD"); this.touch(hmUI.event.CLICK_DOWN, info) },
      (info) => { logger.debug("callback:CI"); this.touch(hmUI.event.CLICK_UP, info) },
      (info) => { logger.debug("callbackM:"); this.touch(hmUI.event.MOVE, info) },
      (info) => { logger.debug("callbackMI:"); this.touch(hmUI.event.MOVE_IN, info) },
      (info) => { logger.debug("callbackMO:"); this.touch(hmUI.event.MOVE_OUT, info) },
    ]
    this.controlLastY = 0
  }
  start() {
    this.inputbox.onCreate()
    this.keyboard.onCreate()
    this.controlPlane = hmUI.createWidget(hmUI.widget.TEXT, { x: 0, y: 0, w: px(480), h: px(480), text: '' })
    this.controlPlane.addEventListener(hmUI.event.CLICK_DOWN, this.controlCallBack[0])
    this.controlPlane.addEventListener(hmUI.event.CLICK_UP, this.controlCallBack[1])
    this.controlPlane.addEventListener(hmUI.event.MOVE, this.controlCallBack[2]) // TODO 可能不存在这种事件
    this.controlPlane.addEventListener(hmUI.event.MOVE_IN, this.controlCallBack[3]) // TODO 可能不存在这种事件
    this.controlPlane.addEventListener(hmUI.event.MOVE_OUT, this.controlCallBack[4]) // TODO 可能不存在这种事件

  }
  touch(event, info) {
    logger.debug('callback:', JSON.stringify(info))
    let res = null // inputbox和keyboard通信用的临时变量，保存cuber::event数据包
    if (info.y < BOUNDARY_Y) { // inputbox
      if (this.controlLastY >= BOUNDARY_Y) {
        res = this.keyboard.onTouch(hmUI.event.MOVE_OUT, info)
        res && this.inputbox.link(res)
      }
      res = this.inputbox.onTouch(event, info);
      res && this.keyboard.link(res)
    } else { // keyboard
      if (this.controlLastY < BOUNDARY_Y) {
        res = this.inputbox.onTouch(hmUI.event.MOVE_OUT, info);
        res && this.keyboard.link()
      }
      res = this.keyboard.onTouch(event, info)
      res && this.inputbox.link(res)
    }
    logger.debug('onTouch() return:', JSON.stringify(res))
    if (res && res.type == LINK_EVENT_TYPE.FINISH) { this.finish() }
    this.controlLastY = info.y
  }
  link(isToInput, res) {
    if(isToInput) {this.inputbox.link(res)}
    else {this.keyboard.link(res)}
  }
  finish() {
    this.controlPlane.removeEventListener(hmUI.event.CLICK_DOWN, this.controlCallBack[0])
    this.controlPlane.removeEventListener(hmUI.event.CLICK_UP, this.controlCallBack[1])
    this.controlPlane.removeEventListener(hmUI.event.MOVE, this.controlCallBack[2]) // TODO 可能不存在这种事件
    // 返回
    hmApp.startApp({
      appid: data.json.from.appid, url: data.json.from.url, param: JSON.stringify({
        text: this.inputbox.getText(),
        param: data.json.from.param,
      })
    })
  }
}

// 类中包含
// onCreate() 
// onTouch(event, info) 若位置不在范围内event为MOVE_OUT 返回值为输入类型 
// 返回值
// onDelete()
// link() inputbox和keyboard之间的通信事件处理
const KeyBoardCondition = {
  FREE: 0,
  WAIT_WORD: 1, // 等候选词
  PRESS: 2, // 按下状态
}
export const KeyBoardLib = [
  class EN {
    constructor({ singleKeyboard, father }) {
      this.singleKeyboard = singleKeyboard
      this.background = null
      this.functionBar = null
      this.functionBarWidgets = []
      this.buttonImg = null
      this.buttonLineSafeDistance = [10, 33, 79, null]
      this.buttonLineNum = 4
      this.moreKeyTimer = null
      this.condition = KeyBoardCondition.FREE
      this.capsLock = false
      this.father = father
      this.waitWordLength = 0 // 等候取词的原字符串总长度
      this.pressMask = {
        widget: null,
        border: {
          x: 0, y: 0, w: 0, h: 0
        }
      }
      this.lastButton = {
        isFuncBar: false,
        index: -1,
        tick: 0,
        target: -1,
        func: null 
      }
      this.timerForTick = timer.createTimer(1, 100, option => {
        if(this.condition & KeyBoardCondition.PRESS) {
          if(this.lastButton.tick != -1){this.lastButton.tick++
          if(this.lastButton.tick > this.lastButton.target) {
            this.lastButton.tick = -1
            this.lastButton.func(this)
          }}
        }
        else {
          this.lastButton.tick = -1
        }
      }, {})

    }
    setCapsLock(bLock) {
      this.capsLock = bLock
      if (bLock) {
        this.buttonImg.setProperty(hmUI.prop.SRC, "image/keyboardEN_button_UP.png")
      } else {
        this.buttonImg.setProperty(hmUI.prop.SRC, "image/keyboardEN_button.png")
      }
    }
    chooseWord(index) { //选择候选词
      // TODO
    }
    getKeyIndex(isFuncBar, info) {
      if (isFuncBar) {
        //TODO
      } else {
        switch (Math.floor((info.y - BOUNDARY_Y - FUNCTION_BAR_H) / px(60))) {
          case 0: return Math.floor((info.x - this.buttonLineSafeDistance[0]) / px(46))
          case 1: return Math.floor((info.x - this.buttonLineSafeDistance[1]) / px(46)) + 10
          case 2: return Math.floor((info.x - this.buttonLineSafeDistance[2]) / px(46)) + 19
          case 3:
            if (info.x <= 175) { // CapsLock
              return 26
            } else if (info.x < 305) { // space
              return 27
            } else { // Delete
              return 28
            }
        }
      }
    }
    getKeyBorder(isFuncBar, index) {
      if (index < 10) return {
        x: this.buttonLineSafeDistance[0] + px(4) + px(46) * index,
        y: BOUNDARY_Y + FUNCTION_BAR_H + px(5),
        w: px(38),
        h: px(50)
      }
      else if (index < 19) return {
        x: this.buttonLineSafeDistance[1] + px(4) + px(46) * (index - 10),
        y: BOUNDARY_Y + FUNCTION_BAR_H + px(65),
        w: px(38),
        h: px(50)
      }
      else if (index < 26) return {
        x: this.buttonLineSafeDistance[2] + px(4) + px(46) * (index - 19),
        y: BOUNDARY_Y + FUNCTION_BAR_H + px(125),
        w: px(38),
        h: px(50)
      }
      else {
        switch (index) {
          case 26: return { x: px(83), y: px(425), w: px(92), h: px(48) } // CapsLock
          case 27: return { x: px(180), y: px(425), w: px(120), h: px(47) } // Space
          case 28: return { x: px(305), y: px(425), w: px(92), h: px(48) } // Delete
        }
      }
    }
    longPress() {
      click()
      if(this.lastButton.isFuncBar) { // 工具栏

      } else { // 按键
        if(this.lastButton.index < 26) {
          this.father.link(true, {
            event: LINK_EVENT_TYPE.CHANGE,
            data: (['1','2','3','4','5','6','7','8','9','0','!','@','#','-','%','&','*','(',')','~','/','.',',',':',';','?'])[this.lastButton.index]
          })
        } else {
          switch(this.lastButton.index) {
            case 26: break //TODO capslock
            case 27: break // space
            case 28: // delete
            this.lastButton.tick = data.json.longPressTicks - 1
            this.lastButton.func = () => {
              if(this.condition & KeyBoardCondition.PRESS) {
                click()
                this.father.link(true, {
                  event: LINK_EVENT_TYPE.DELETE,
                  data: 1
                })
              } else {
                this.lastButton.tick = -1
              }
            }
            break
          }
        }
      }
    }
    onCreate() {
      // 新建功能栏
      if (DEVICE_SHAPE) { // 圆屏
        this.functionBar = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y,
          color: data.json.theme.functionBar.color, radius: px(0)
        })
        new Fx({
          begin: px(400) - FUNCTION_BAR_H, end: BOUNDARY_Y, fps: 60, time: 0.3, style: Fx.Styles.EASE_IN_QUAD,
          func: res => this.functionBar.setProperty(hmUI.prop.Y, res), onStop() { logger.debug("functionBar onStop") }
        })
      }
      // 创建背景  
      if (DEVICE_SHAPE) { // 圆屏
        this.background = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
          color: data.json.theme.background.color, radius: px(0)
        })
        this.buttonImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: px(0), y: px(400), w: px(480), h: px(240),
          src: "image/keyboardEN_button.png"
        })
        new Fx({
          begin: px(400), end: BOUNDARY_Y + FUNCTION_BAR_H, fps: 60, time: 0.3, style: Fx.Styles.EASE_IN_QUAD,
          func: res => this.background.setProperty(hmUI.prop.Y, res) | this.buttonImg.setProperty(hmUI.prop.Y, res), onStop() { logger.debug("background onStop") }
        })
      } else { // 方屏
        // TODO
      }

      // 创建按钮遮罩
      this.pressMask.widget = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x: px(500), y: px(0), w: px(42), h: px(50),
        color: data.json.theme.button.press_color,
        line_width: px(3),
        radius: data.json.theme.button.radius
      })
    }
    onTouch(event, info) {
      if (info.y < BOUNDARY_Y + FUNCTION_BAR_H) { // 工具栏

      }
      else { // 键盘
        let index = this.getKeyIndex(false, info)
        logger.debug("onTouch receive key index:" + index)
        
        this.lastButton.isFuncBar = false
        this.lastButton.index = index
        this.lastButton.tick = 0
        this.lastButton.target = data.json.longPressTicks
        this.lastButton.func = this.longPress
        switch (event) {
          case hmUI.event.CLICK_UP:
            
              this.condition &= ~KeyBoardCondition.PRESS // 清除此状态位
              let temp = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
                ...this.pressMask.border,
                color: data.json.theme.button.press_color,
                line_width: px(3),
                radius: data.json.theme.button.radius

              })
              new Fx({
                begin: 0, end: 1.0, style: Fx.Styles.EASE_OUT_QUAD, fps: 30, time: 0.18,
                func: res => temp.setProperty(hmUI.prop.COLOR, Fx.getMixColor(data.json.theme.button.press_color,
                  data.json.theme.button.color, res))
                , onStop: () => hmUI.deleteWidget(temp)
              })
              this.pressMask.border = { x: px(500), y: px(0) }
              this.pressMask.widget.setProperty(hmUI.prop.MORE, this.pressMask.border)
            switch(index) {
              case 28: 
              return{event: LINK_EVENT_TYPE.DELETE, data: 1}
            }
            break
          case hmUI.event.MOVE_OUT:
          case hmUI.event.MOVE_IN:
          case hmUI.event.MOVE: ///////////////////////
            if (index < 26) { // input letter
              this.condition |= KeyBoardCondition.PRESS
              let border = this.getKeyBorder(false, index)
              this.pressMask.border = border
              this.pressMask.widget.setProperty(hmUI.prop.MORE, border)
              return {
                event: LINK_EVENT_TYPE.CHANGE,
                data: this.capsLock
                  ? (['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'])[index]
                  : (['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'])[index]
              }
            } else { // press func
              let border = this.getKeyBorder(false, index)
              this.pressMask.border = border
              this.pressMask.widget.setProperty(hmUI.prop.MORE, border)
              switch (index) {

                case 26: // capsLock
                  //this.setCapsLock(!this.capsLock);
                  break;
                case 27: // space
                  return { event: LINK_EVENT_TYPE.CHANGE, data: ' ' }
                  break
                case 28: // delete
              }
            }
            break;
          case hmUI.event.CLICK_DOWN:
            click()
            if (index < 26) { // input letter
              this.condition |= KeyBoardCondition.PRESS
              let border = this.getKeyBorder(false, index)
              this.pressMask.widget.setProperty(hmUI.prop.MORE, border)
              this.pressMask.border = border
              return {
                event: LINK_EVENT_TYPE.INPUT,
                data: this.capsLock
                  ? (['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'])[index]
                  : (['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'])[index]
              }
            } else { // press func
              let border = this.getKeyBorder(false, index)
              this.pressMask.widget.setProperty(hmUI.prop.MORE, border)
              this.pressMask.border = border
              switch (index) {
                case 26: // capsLock
                  this.setCapsLock(!this.capsLock);
                  break;
                case 27: // space
                  // if (this.condition && KeyBoardCondition.WAIT_WORD) this.chooseWord(0)
                  // else 
                  return { event: LINK_EVENT_TYPE.INPUT, data: ' ' }
                  break
                case 28: // delete

              }

            }
            break

        }
      }
    }
    onDelete() { }
    link(event) { }
  },
]

// 类中包含
// onCreate() 
// onTouch(event, info) 若位置不在范围内event为MOVE_OUT 返回值为输入类型 
// onDelete()
// getText()
// link() inputbox和keyboard之间的通信事件处理
const InputBoxLib = [
  class NORMAL {
    constructor({ test, father }) {
      this.borderWidget = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x: px(50),
        y: px(70),
        w: px(380),
        h: px(55),
        line_width: px(5),
        color: 0xffffff,
        radius: px(8)
      })
      this.father = father
      this.text = 'abc'
      this.textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(60),
        y: px(80),
        w: px(360),
        h: px(35),
        text: this.text,
        text_size: px(30),
        color: 0xffffff
      })
    }
    onCreate() { }
    onTouch(event, info) { }
    link(res) {
      logger.debug("inputBox.link: package" + JSON.stringify(res))
      switch (res.event) {
        case LINK_EVENT_TYPE.INPUT:
          this.text = this.text + res.data
          break
        case LINK_EVENT_TYPE.DELETE:
          if (this.text.length) {
            this.text = this.text.substring(0, this.text.length - 1)
          }
          else {
            logger.debug('inputBox: text is empty')
          }
          break
        case LINK_EVENT_TYPE.CHANGE:
          if (this.text.length) {
            this.text = this.text.substring(0, this.text.length - 1)
          }
          else {
            logger.debug('inputBox: text is empty')
          }
          this.text = this.text + res.data
      }
      this.textWidget.setProperty(hmUI.prop.TEXT, this.text)
    }
    onDelete() { }
    getText() { }
  },
]