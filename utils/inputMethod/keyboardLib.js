
// 类中包含
// onCreate() 
// onTouch(event, info) 若位置不在范围内event为MOVE_OUT 返回值为输入类型 
// 返回值
// onDelete()
// link() inputbox和keyboard之间的通信事件处理

import { BOUNDARY_Y, FUNCTION_BAR_H, LINK_EVENT_TYPE, click } from "./inputMethod"
import { Fx } from "../fx"
import { data } from "../data";
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT, screenShape: DEVICE_SHAPE } = hmSetting.getDeviceInfo()

const logger = DeviceRuntimeCore.HmLogger.getLogger('keyboardLib.js')

export const KeyBoardCondition = {
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
        index: -1
      }
      this.longPressTimer = null
    }
    setCapsLock(bLock) {
      this.capsLock = bLock
      if (bLock) {
        this.buttonImg.setProperty(hmUI.prop.SRC, data.json.theme.keyboard.button.src_up)
      } else {
        this.buttonImg.setProperty(hmUI.prop.SRC, data.json.theme.keyboard.button.src)
      }
    }
    chooseWord(index) { //选择候选词
      // TODO
    }
    getKeyIndex(isFuncBar, info) {
      if (isFuncBar) {
        //TODO
      } else {
        let min0 = x => x < 0 ? 0 : x
        let maxBorder = (x, border) => x > border ? border : x
        switch (Math.floor((info.y - BOUNDARY_Y - FUNCTION_BAR_H) / px(60))) {
          case 0: return maxBorder(min0(Math.floor((info.x - this.buttonLineSafeDistance[0]) / px(46))), 9)
          case 1: return maxBorder(min0(Math.floor((info.x - this.buttonLineSafeDistance[1]) / px(46))), 8) + 10
          case 2: return maxBorder(min0(Math.floor((info.x - this.buttonLineSafeDistance[2]) / px(46))), 6) + 19
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

      timer.stopTimer(this.longPressTimer)
      this.longPressTimer = null
      if (this.lastButton.isFuncBar) { // 工具栏

      } else { // 按键
        if (this.lastButton.index < 26) {
          click()
          this.father.link(true, {
            event: LINK_EVENT_TYPE.CHANGE,
            data: (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '-', '%', '&', '*', '(', ')', '~', '/', '.', ',', ':', ';', '?'])[this.lastButton.index]
          })
        } else {
          switch (this.lastButton.index) {
            case 26: break //TODO capslock
            case 27: break // space
            case 28: // delete
              logger.debug("timer for delete! create")
              this.longPressTimer = timer.createTimer(
                5,
                data.json.delTimeMs,
                option => {
                  logger.debug("timer for delete! callback")

                  if (this.condition & KeyBoardCondition.PRESS) {
                    click()
                    this.father.link(true, {
                      event: LINK_EVENT_TYPE.DELETE,
                      data: 1
                    })
                  } else {
                    timer.stopTimer(this.longPressTimer)
                  }
                },
                {}
              )
              break

          }
        }
      }
    }
    onCreate() {
      // 新建功能栏
      if (DEVICE_SHAPE) { // 圆屏
        if (data.json.theme.keyboard.functionBar.type == "rect") {
          this.functionBar = hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y,
            color: data.json.theme.keyboard.functionBar.color, radius: px(0)
          })
        }
        else if (data.json.theme.keyboard.functionBar.type == "img") {
          this.functionBar = hmUI.createWidget(hmUI.widget.IMG, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y,
            pos_x: 0, pos_y: 0 - px(400),
            src: data.json.theme.keyboard.functionBar.src
          })
        }
        new Fx({
          begin: px(400) - FUNCTION_BAR_H, end: BOUNDARY_Y, fps: 60, time: 0.2, style: Fx.Styles.EASE_IN_QUAD,enable:true,
          func: res => { if (data.json.theme.keyboard.functionBar.type == "img") { this.functionBar.setProperty(hmUI.prop.MORE, { y: res, pos_y: 0 - res }) } else if (data.json.theme.keyboard.functionBar.type == "rect") { this.functionBar.setProperty(hmUI.prop.Y, res) } }, onStop() { /* logger.debug("functionBar onStop") */ }
        })
      }
      // 创建背景  
      if (DEVICE_SHAPE) { // 圆屏
        if (data.json.theme.keyboard.background.type == "rect") {
          this.background = hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
            color: data.json.theme.keyboard.background.color, radius: px(0)
          })
        }
        else if (data.json.theme.keyboard.background.type == "img") {
          this.background = hmUI.createWidget(hmUI.widget.IMG, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
            pos_x: 0, pos_y: 0 - px(400),
            src: data.json.theme.keyboard.background.src
          })
        }
        this.buttonImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: px(0), y: px(400), w: px(480), h: px(240),
          src: data.json.theme.keyboard.button.src
        })
        new Fx({
          begin: px(400), end: BOUNDARY_Y + FUNCTION_BAR_H, fps: 60, time: 0.2, style: Fx.Styles.EASE_IN_QUAD,enable:true,
          func: res => {
            if (data.json.theme.keyboard.background.type == "img") {
              this.background.setProperty(hmUI.prop.MORE, {
                y: res, pos_y: 0 - res
              })
            }
            else if (data.json.theme.keyboard.background.type == "rect") {
              this.background.setProperty(hmUI.prop.Y, res)
            }
            this.buttonImg.setProperty(hmUI.prop.Y, res)
          }

          , onStop() { /* logger.debug("background onStop") */ }
        })
      } else { // 方屏
        // TODO
      }

      // 创建按钮遮罩
      this.pressMask.widget = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x: px(500), y: px(0), w: px(42), h: px(50),
        color: data.json.theme.keyboard.button.press_color,
        line_width: px(3),
        radius: data.json.theme.keyboard.button.radius
      })
    }
    onTouch(event, info) {
      if (info.y < BOUNDARY_Y + FUNCTION_BAR_H) { // 工具栏

      }
      else { // 键盘
        let index = this.getKeyIndex(false, info)
        // logger.debug("onTouch receive key index:" + index)

        switch (event) {
          case hmUI.event.CLICK_UP:
            if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
            this.condition &= ~KeyBoardCondition.PRESS // 清除此状态位
            let temp = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
              ...this.pressMask.border,
              color: data.json.theme.keyboard.button.press_color,
              line_width: px(3),
              radius: data.json.theme.keyboard.button.radius

            })
            new Fx({
              begin: 0, end: 1.0, style: Fx.Styles.EASE_OUT_QUAD, fps: 30, time: 0.1,enable:true,
              func: res => temp.setProperty(hmUI.prop.COLOR, Fx.getMixColor(data.json.theme.keyboard.button.press_color,
                data.json.theme.keyboard.button.color, res))
              , onStop: () => { hmUI.deleteWidget(temp) }
            })
            this.pressMask.border = { x: px(500), y: px(0) }
            this.pressMask.widget.setProperty(hmUI.prop.MORE, this.pressMask.border)

            break
          case hmUI.event.MOVE_OUT:
          case hmUI.event.MOVE_IN:
          case hmUI.event.MOVE: ///////////////////////

            if (index < 26) { // input letter
              this.condition |= KeyBoardCondition.PRESS

              if (this.lastButton.index != index && !this.lastButton.isFuncBar) {
                if (this.longPressTimer) {
                  timer.stopTimer(this.longPressTimer)
                }
                let border = this.getKeyBorder(false, index)
                this.pressMask.border = border
                this.pressMask.widget.setProperty(hmUI.prop.MORE, border)
                click()
                this.lastButton.isFuncBar = false
                this.lastButton.index = index
                if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
                this.longPressTimer = timer.createTimer(data.json.longPressMsAfterMove, 2147483648,
                  option => this.longPress(), {}
                )
                return {
                  event: LINK_EVENT_TYPE.CHANGE,
                  data: this.capsLock
                    ? (['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'])[index]
                    : (['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'])[index]
                }
              }
            } else { // press func
              if (this.lastButton.index != index && !this.lastButton.isFuncBar) {
                let border = this.getKeyBorder(false, index)
                this.pressMask.border = border
                this.pressMask.widget.setProperty(hmUI.prop.MORE, border)

                this.lastButton.isFuncBar = false
                this.lastButton.index = index
                if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
                this.longPressTimer = timer.createTimer(data.json.longPressMs, 2147483648,
                  option => this.longPress(), {}
                )
                switch (index) {

                  case 26: // capsLock
                    //this.setCapsLock(!this.capsLock);
                    break;
                  case 27: // space
                    return { event: LINK_EVENT_TYPE.CHANGE, data: ' ' }
                    break
                  case 28: // delete
                    return { event: LINK_EVENT_TYPE.DELETE, data: 1 }
                }
              }
            }
            break;
          case hmUI.event.CLICK_DOWN:
            click()
            this.lastButton.isFuncBar = false
            this.lastButton.index = index
            if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
            this.longPressTimer = timer.createTimer(data.json.longPressMs, 2147483648,
              option => this.longPress(), {}
            )
            this.condition |= KeyBoardCondition.PRESS
            if (index < 26) { // input letter
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
                  return { event: LINK_EVENT_TYPE.DELETE, data: 1 }
              }

            }
            break

        }
      }
    }
    onDelete() { }
    link(event) { }
  },
  class ZH_CN_PY {
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
        index: -1
      }
      this.longPressTimer = null
    }
    setCapsLock(bLock) {
      this.capsLock = bLock
      if (bLock) {
        this.buttonImg.setProperty(hmUI.prop.SRC, data.json.theme.keyboard.button.src_up)
      } else {
        this.buttonImg.setProperty(hmUI.prop.SRC, data.json.theme.keyboard.button.src)
      }
    }
    chooseWord(index) { //选择候选词
      // TODO
    }
    getKeyIndex(isFuncBar, info) {
      if (isFuncBar) {
        //TODO
      } else {
        let min0 = x => x < 0 ? 0 : x
        let maxBorder = (x, border) => x > border ? border : x
        switch (Math.floor((info.y - BOUNDARY_Y - FUNCTION_BAR_H) / px(60))) {
          case 0: return maxBorder(min0(Math.floor((info.x - this.buttonLineSafeDistance[0]) / px(46))), 9)
          case 1: return maxBorder(min0(Math.floor((info.x - this.buttonLineSafeDistance[1]) / px(46))), 8) + 10
          case 2: return maxBorder(min0(Math.floor((info.x - this.buttonLineSafeDistance[2]) / px(46))), 6) + 19
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

      timer.stopTimer(this.longPressTimer)
      this.longPressTimer = null
      if (this.lastButton.isFuncBar) { // 工具栏

      } else { // 按键
        if (this.lastButton.index < 26) {
          click()
          this.father.link(true, {
            event: LINK_EVENT_TYPE.CHANGE,
            data: (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '-', '%', '&', '*', '(', ')', '~', '/', '.', ',', ':', ';', '?'])[this.lastButton.index]
          })
        } else {
          switch (this.lastButton.index) {
            case 26: break //TODO capslock
            case 27: break // space
            case 28: // delete
              logger.debug("timer for delete! create")
              this.longPressTimer = timer.createTimer(
                5,
                data.json.delTimeMs,
                option => {
                  logger.debug("timer for delete! callback")

                  if (this.condition & KeyBoardCondition.PRESS) {
                    click()
                    this.father.link(true, {
                      event: LINK_EVENT_TYPE.DELETE,
                      data: 1
                    })
                  } else {
                    timer.stopTimer(this.longPressTimer)
                  }
                },
                {}
              )
              break

          }
        }
      }
    }
    onCreate() {
      // 新建功能栏
      if (DEVICE_SHAPE) { // 圆屏
        if (data.json.theme.keyboard.functionBar.type == "rect") {
          this.functionBar = hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y,
            color: data.json.theme.keyboard.functionBar.color, radius: px(0)
          })
        }
        else if (data.json.theme.keyboard.functionBar.type == "img") {
          this.functionBar = hmUI.createWidget(hmUI.widget.IMG, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y,
            pos_x: 0, pos_y: 0 - px(400),
            src: data.json.theme.keyboard.functionBar.src
          })
        }
        new Fx({
          begin: px(400) - FUNCTION_BAR_H, end: BOUNDARY_Y, fps: 60, time: 0.2, style: Fx.Styles.EASE_IN_QUAD,enable:true,
          func: res => { if (data.json.theme.keyboard.functionBar.type == "img") { this.functionBar.setProperty(hmUI.prop.MORE, { y: res, pos_y: 0 - res }) } else if (data.json.theme.keyboard.functionBar.type == "rect") { this.functionBar.setProperty(hmUI.prop.Y, res) } }, onStop() { /* logger.debug("functionBar onStop") */ }
        })
      }
      // 创建背景  
      if (DEVICE_SHAPE) { // 圆屏
        if (data.json.theme.keyboard.background.type == "rect") {
          this.background = hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
            color: data.json.theme.keyboard.background.color, radius: px(0)
          })
        }
        else if (data.json.theme.keyboard.background.type == "img") {
          this.background = hmUI.createWidget(hmUI.widget.IMG, {
            x: px(0), y: px(400), w: px(480), h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
            pos_x: 0, pos_y: 0 - px(400),
            src: data.json.theme.keyboard.background.src
          })
        }
        this.buttonImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: px(0), y: px(400), w: px(480), h: px(240),
          src: data.json.theme.keyboard.button.src
        })
        new Fx({
          begin: px(400), end: BOUNDARY_Y + FUNCTION_BAR_H, fps: 60, time: 0.2, style: Fx.Styles.EASE_IN_QUAD,enable:true,
          func: res => {
            if (data.json.theme.keyboard.background.type == "img") {
              this.background.setProperty(hmUI.prop.MORE, {
                y: res, pos_y: 0 - res
              })
            }
            else if (data.json.theme.keyboard.background.type == "rect") {
              this.background.setProperty(hmUI.prop.Y, res)
            }
            this.buttonImg.setProperty(hmUI.prop.Y, res)
          }

          , onStop() { /* logger.debug("background onStop") */ }
        })
      } else { // 方屏
        // TODO
      }

      // 创建按钮遮罩
      this.pressMask.widget = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
        x: px(500), y: px(0), w: px(42), h: px(50),
        color: data.json.theme.keyboard.button.press_color,
        line_width: px(3),
        radius: data.json.theme.keyboard.button.radius
      })
    }
    onTouch(event, info) {
      if (info.y < BOUNDARY_Y + FUNCTION_BAR_H) { // 工具栏

      }
      else { // 键盘
        let index = this.getKeyIndex(false, info)
        // logger.debug("onTouch receive key index:" + index)

        switch (event) {
          case hmUI.event.CLICK_UP:
            if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
            this.condition &= ~KeyBoardCondition.PRESS // 清除此状态位
            let temp = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
              ...this.pressMask.border,
              color: data.json.theme.keyboard.button.press_color,
              line_width: px(3),
              radius: data.json.theme.keyboard.button.radius

            })
            new Fx({
              begin: 0, end: 1.0, style: Fx.Styles.EASE_OUT_QUAD, fps: 30, time: 0.1,enable:true,
              func: res => temp.setProperty(hmUI.prop.COLOR, Fx.getMixColor(data.json.theme.keyboard.button.press_color,
                data.json.theme.keyboard.button.color, res))
              , onStop: () => { hmUI.deleteWidget(temp) }
            })
            this.pressMask.border = { x: px(500), y: px(0) }
            this.pressMask.widget.setProperty(hmUI.prop.MORE, this.pressMask.border)

            break
          case hmUI.event.MOVE_OUT:
          case hmUI.event.MOVE_IN:
          case hmUI.event.MOVE: ///////////////////////

            if (index < 26) { // input letter
              this.condition |= KeyBoardCondition.PRESS

              if (this.lastButton.index != index && !this.lastButton.isFuncBar) {
                if (this.longPressTimer) {
                  timer.stopTimer(this.longPressTimer)
                }
                let border = this.getKeyBorder(false, index)
                this.pressMask.border = border
                this.pressMask.widget.setProperty(hmUI.prop.MORE, border)
                click()
                this.lastButton.isFuncBar = false
                this.lastButton.index = index
                if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
                this.longPressTimer = timer.createTimer(data.json.longPressMsAfterMove, 2147483648,
                  option => this.longPress(), {}
                )
                return {
                  event: LINK_EVENT_TYPE.CHANGE,
                  data: this.capsLock
                    ? (['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'])[index]
                    : (['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'])[index]
                }
              }
            } else { // press func
              if (this.lastButton.index != index && !this.lastButton.isFuncBar) {
                let border = this.getKeyBorder(false, index)
                this.pressMask.border = border
                this.pressMask.widget.setProperty(hmUI.prop.MORE, border)

                this.lastButton.isFuncBar = false
                this.lastButton.index = index
                if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
                this.longPressTimer = timer.createTimer(data.json.longPressMs, 2147483648,
                  option => this.longPress(), {}
                )
                switch (index) {

                  case 26: // capsLock
                    //this.setCapsLock(!this.capsLock);
                    break;
                  case 27: // space
                    return { event: LINK_EVENT_TYPE.CHANGE, data: ' ' }
                    break
                  case 28: // delete
                    return { event: LINK_EVENT_TYPE.DELETE, data: 1 }
                }
              }
            }
            break;
          case hmUI.event.CLICK_DOWN:
            click()
            this.lastButton.isFuncBar = false
            this.lastButton.index = index
            if (this.longPressTimer) { timer.stopTimer(this.longPressTimer) }
            this.longPressTimer = timer.createTimer(data.json.longPressMs, 2147483648,
              option => this.longPress(), {}
            )
            this.condition |= KeyBoardCondition.PRESS
            if (index < 26) { // input letter
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
                  return { event: LINK_EVENT_TYPE.DELETE, data: 1 }
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