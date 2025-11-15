/*
 * Created:  CuberQAQ
 * Date:     2022/10/2
 * Describe: A JS class for Input Method
 */
import * as hmUI from "@zos/ui";

import { InputBoxLib } from "./inputboxLib";
import { KeyBoardLib } from "./keyboardLib";
import {
  KEYBOARD_TYPE,
  INPUTBOX_TYPE,
  LINK_EVENT_TYPE,
  KeyBoardCondition,
  InputboxCondition,
} from "./enums";
import { BOUNDARY_Y,CONTROL_PLANE_TEXT_STYLE } from "./styles";

const app = getApp();
const globalData = app._options.globalData;

// InputMethod 输入法类
// 包含一个InputBox实例和一个Keyboard可选列表，通过一个control面板将触控事件分发给两个实例
export class InputMethod {
  constructor({ keyboard_type, inputbox_type, text, title }) {
    this.keyboardType = keyboard_type ?? KEYBOARD_TYPE.ENGLISH;
    this.inputboxType = inputbox_type ?? INPUTBOX_TYPE.NORMAL;

    if (!Object.values(KEYBOARD_TYPE).includes(this.keyboardType)) {
      console.log(
        "keyboard.js: ERROR invalid keyboard_type",
        this.keyboardType,
      );
      return;
    }
    if (!Object.values(INPUTBOX_TYPE).includes(this.inputboxType)) {
      console.log(
        "keyboard.js: ERROR invalid inputbox_type",
        this.inputboxType,
      );
      return;
    }

    this.keyboard = new KeyBoardLib[this.keyboardType]({
      father: this,
    });
    this.inputbox = new InputBoxLib[this.inputboxType]({
      father: this,
      text,
      title,
    });
    this.controlPlane = null;
    this.controlCallBack = [
      (info) => {
        /* console.log("callback:CD"); */ this.touch(
          hmUI.event.CLICK_DOWN,
          info,
        );
      },
      (info) => {
        /* console.log("callback:CI"); */ this.touch(hmUI.event.CLICK_UP, info);
      },
      (info) => {
        /* console.log("callbackM:"); */ this.touch(hmUI.event.MOVE, info);
      },
      (info) => {
        /* console.log("callbackMI:"); */ this.touch(hmUI.event.MOVE_IN, info);
      },
      (info) => {
        /* console.log("callbackMO:"); */ this.touch(hmUI.event.MOVE_OUT, info);
      },
    ];
    this.controlLastY = 0;
  }
  start() {
    this.inputbox.onCreate();
    this.keyboard.onCreate();
    this.controlPlane = hmUI.createWidget(hmUI.widget.TEXT, CONTROL_PLANE_TEXT_STYLE);
    this.controlPlane.addEventListener(
      hmUI.event.CLICK_DOWN,
      this.controlCallBack[0],
    );
    this.controlPlane.addEventListener(
      hmUI.event.CLICK_UP,
      this.controlCallBack[1],
    );
    this.controlPlane.addEventListener(
      hmUI.event.MOVE,
      this.controlCallBack[2],
    ); // TODO 可能不存在这种事件
    this.controlPlane.addEventListener(
      hmUI.event.MOVE_IN,
      this.controlCallBack[3],
    ); // TODO 可能不存在这种事件
    this.controlPlane.addEventListener(
      hmUI.event.MOVE_OUT,
      this.controlCallBack[4],
    ); // TODO 可能不存在这种事件
  }
  touch(event, info) {
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
    // console.log('onTouch() return:', JSON.stringify(res))
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
      this.controlCallBack[0],
    );
    this.controlPlane.removeEventListener(
      hmUI.event.CLICK_UP,
      this.controlCallBack[1],
    );
    this.controlPlane.removeEventListener(
      hmUI.event.MOVE,
      this.controlCallBack[2],
    ); // TODO 可能不存在这种事件
    // 返回
    // if (globalData.params.targetAppid && globalData.params.targetUrl) {
    //   hmApp.startApp({
    //     appid: globalData.params.targetAppid,
    //     url: globalData.params.targetUrl,
    //     param: JSON.stringify({
    //       ...globalData.params.targetExtraParam,
    //       input: this.inputbox.text,
    //     }),
    //   });
    // }
  }
  delete() {}
  getText() {
    return this.inputbox.text;
  }
  setText(text) {
    this.inputbox.text = text;
  }
  static KEYBOARD_TYPE = KEYBOARD_TYPE;
  static INPUTBOX_TYPE = INPUTBOX_TYPE;
}
