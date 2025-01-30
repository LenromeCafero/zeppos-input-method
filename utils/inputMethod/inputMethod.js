/*
 * Created:  CuberQAQ
 * Date:     2022/10/2
 * Describe: A JS class for Input Method
 */

import { data } from "../data";
import { InputBoxLib } from "./inputboxLib";
import { KeyBoardLib } from "./keyboardLib";

const globalData = getApp()._options.globalData;

//import { data } from "./data"
const logger = DeviceRuntimeCore.HmLogger.getLogger("inputMethod.js");
// var vibrate = null;
var ball = null;
export function click() {
  // vibrate.stop();
  // vibrate.scene = 0;
  // vibrate.start();
  if (ball == null) {
    ball = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: px(30),
      h: px(30),
      radius: px(15),
      color: 0xff0000,
    });
  } else {
    ball.setProperty(hmUI.prop.COLOR, 0xff0000);
  }
  let _ = timer.createTimer(50, 2147483648, (option) => {
    ball.setProperty(hmUI.prop.COLOR, 0x000000);
    timer.stopTimer(_);
  });
}

// DEVICE_SHAPE: [0]方屏 | [1]圆屏
const {
  width: DEVICE_WIDTH,
  height: DEVICE_HEIGHT,
  screenShape: DEVICE_SHAPE,
} = hmSetting.getDeviceInfo();
export const data2 = {
  //TODO
  json: {
    keyboardList: [0, 1, 2],
    from: {
      appid: 0,
      url: "",
      param: "{}", //传参，提供给调用源作为补充，会一模一样返回去
    },
    theme: {
      inputbox: {
        finishBtn: {
          normal_color: 0xfff1a6,
          press_color: 0x666142,
        },
        inputBoxMask: {
          src: "image/inputbox_mask_Earth.png",
        },
        background: {
          color: 0x333333,
          type: "img",
          src: "image/inputbox_bgd_Earth.png",
        },
      },
      keyboard: {
        functionBar: {
          color: 0x494949,
          type: "img",
          src: "image/functionBar_Earth.png",
        },
        background: {
          color: 0x222222,
          type: "img",
          src: "image/keyboard_bgd_Earth.png",
        },
        button: {
          color: 0x555555,
          radius: 6,
          distance_v: 6, // 行之间距离
          distance_h: 6, //列之间距离
          press_color: 0xee6666,
          src: "image/keyboardEN_button_Earth.png",
          src_up: "image/keyboardEN_button_Earth_UP.png",
        },
      },
    },

    // "theme": { //dark
    //   "inputbox": {
    //     "finishBtn": {
    //       "normal_color": 0xfff1a6,
    //       "press_color": 0x666142
    //     },
    //     "inputBoxMask": {
    //       "src": "image/inputboxBgd2.png"
    //     },
    //     "background": {
    //       "color": 0x333333,
    //       "type": "rect"
    //     },
    //   },
    //   "keyboard": {
    //     "functionBar": {
    //       "color": 0x494949,
    //       "type": "rect",
    //       "src": "image/functionBar.png"
    //     },
    //     "background": {
    //       "color": 0x222222,
    //       "type": "rect",
    //       //"src": "image/earth2_glass.png"
    //     },
    //     "button": {
    //       "color": 0x555555,
    //       "radius": 6,
    //       "distance_v": 6, // 行之间距离
    //       "distance_h": 6,//列之间距离
    //       "press_color": 0xee6666,
    //       "src": "image/keyboardEN_button_Dark.png"
    //     },
    //   },

    // },
    longPressMs: 300,
    longPressMsAfterMove: 600,
    safetyDistance: px(40),
    delTimeMs: 180,
  },
};
export const themeList = [
  {
    //dark
    inputbox: {
      finishBtn: {
        normal_color: 0xfff1a6,
        press_color: 0x666142,
      },
      inputBoxMask: {
        src: "image/inputboxBgd2.png",
      },
      background: {
        color: 0x333333,
        type: "rect",
      },
    },
    keyboard: {
      functionBar: {
        color: 0x494949,
        type: "rect",
      },
      background: {
        color: 0x222222,
        type: "rect",
      },
      button: {
        color: 0x555555,
        radius: 6,
        distance_v: 6, // 行之间距离
        distance_h: 6, //列之间距离
        press_color: 0xee6666,
      },
    },
  },
];
export const KEYBOARD_TYPE = {
  EN: 0,
  NUM: 1,
  ZH_CN_PY: 2,
};
export const INPUTBOX_TYPE = {
  NORMAL: 0,
  PASSWORD: 1,
};
export const LINK_EVENT_TYPE = {
  FINISH: 1,
  INPUT: 2,
  DELETE: 3,
  CHANGE: 4,
};
export const BOUNDARY_Y = DEVICE_SHAPE ? px(190) : px(190); // InputBox和Keyboard分界线y坐标
export const FUNCTION_BAR_H = DEVICE_SHAPE ? px(50) : px(50); // 预留给选词和工具区域的高度
// InputMethod 输入法类
// 包含一个InputBox实例和一个Keyboard可选列表，通过一个control面板将触控事件分发给两个实例
export class InputMethod {
  constructor({ keyboard_list, inputbox_type, max_byte, text, title }) {
    if (keyboard_list == undefined) {
      this.keyboard_list = data.json.keyboardList;
    } else {
      this.keyboard_list = keyboard_list;
    }
    if (!this.keyboard_list.length) {
      logger.debug("keyboard.js: ERROR empty keyboard_list");
      return;
    }
    this.singleKeyboard = this.keyboard_list.length == 1;
    this.nowKeyboardType = this.keyboard_list[0];
    if (this.nowKeyboardType >= KeyBoardLib.length) {
      logger.debug("keyboard.js: ERROR keyboard_type overflow");
      return;
    }
    this.keyboard = new KeyBoardLib[this.nowKeyboardType]({
      singleKeyboard: this.singleKeyboard,
      father: this,
    });
    this.inputboxType = inputbox_type;
    if (this.inputboxType >= InputBoxLib.length) {
      logger.debug("keyboard.js: ERROR inputbox_type overflow");
      return;
    }
    //TODO this.inputbox = new InputBoxLib[this.inputboxType]({test:666}) //TODO
    this.inputbox = new InputBoxLib[inputbox_type]({
      father: this,
      text,
      title,
    });
    // vibrate = hmSensor.createSensor(hmSensor.id.VIBRATE);
    this.controlPlane = null;
    this.controlCallBack = [
      (info) => {
        /* logger.debug("callback:CD"); */ this.touch(
          hmUI.event.CLICK_DOWN,
          info
        );
      },
      (info) => {
        /* logger.debug("callback:CI"); */ this.touch(
          hmUI.event.CLICK_UP,
          info
        );
      },
      (info) => {
        /* logger.debug("callbackM:"); */ this.touch(hmUI.event.MOVE, info);
      },
      (info) => {
        /* logger.debug("callbackMI:"); */ this.touch(hmUI.event.MOVE_IN, info);
      },
      (info) => {
        /* logger.debug("callbackMO:"); */ this.touch(
          hmUI.event.MOVE_OUT,
          info
        );
      },
    ];
    this.controlLastY = 0;
  }
  start() {
    this.inputbox.onCreate();
    this.keyboard.onCreate();
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
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: "image/roundMark.png",
    });
    this.controlPlane = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      text: "",
    });
    this.controlPlane.addEventListener(
      hmUI.event.CLICK_DOWN,
      this.controlCallBack[0]
    );
    this.controlPlane.addEventListener(
      hmUI.event.CLICK_UP,
      this.controlCallBack[1]
    );
    this.controlPlane.addEventListener(
      hmUI.event.MOVE,
      this.controlCallBack[2]
    ); // TODO 可能不存在这种事件
    this.controlPlane.addEventListener(
      hmUI.event.MOVE_IN,
      this.controlCallBack[3]
    ); // TODO 可能不存在这种事件
    this.controlPlane.addEventListener(
      hmUI.event.MOVE_OUT,
      this.controlCallBack[4]
    ); // TODO 可能不存在这种事件
  }
  touch(event, info) {
    //logger.debug('callback:', JSON.stringify(info))
    let res = null; // inputbox和keyboard通信用的临时变量，保存cuber::event数据包
    if (info.y < BOUNDARY_Y) {
      // inputbox
      if (this.controlLastY >= BOUNDARY_Y) {
        res = this.keyboard.onTouch(hmUI.event.MOVE_OUT, info);
        res && this.inputbox.link(res);
      }
      res = this.inputbox.onTouch(event, info);
      res && this.keyboard.link(res);
    } else {
      // keyboard
      if (this.controlLastY < BOUNDARY_Y) {
        res = this.inputbox.onTouch(hmUI.event.MOVE_OUT, info);
        res && this.keyboard.link();
      }
      res = this.keyboard.onTouch(event, info);
      res && this.inputbox.link(res);
    }
    // logger.debug('onTouch() return:', JSON.stringify(res))
    if (res && res.type == LINK_EVENT_TYPE.FINISH) {
      this.finish();
    }
    this.controlLastY = info.y;
  }
  link(isToInput, res) {
    if (isToInput) {
      this.inputbox.link(res);
    } else {
      this.keyboard.link(res);
    }
  }
  finish() {
    this.controlPlane.removeEventListener(
      hmUI.event.CLICK_DOWN,
      this.controlCallBack[0]
    );
    this.controlPlane.removeEventListener(
      hmUI.event.CLICK_UP,
      this.controlCallBack[1]
    );
    this.controlPlane.removeEventListener(
      hmUI.event.MOVE,
      this.controlCallBack[2]
    ); // TODO 可能不存在这种事件
    // 返回
    if (globalData.params.targetAppid && globalData.params.targetUrl) {
      hmApp.startApp({
        appid: globalData.params.targetAppid,
        url: globalData.params.targetUrl,
        param: JSON.stringify({
          ...globalData.params.targetExtraParam,
          input: this.inputbox.getText(),
        }),
      });
    }
  }
  delete() {
    // vibrate.stop();
  }
}
