/*
 * Created:  CuberQAQ
 * Date:     2022/10/2
 * Describe: A JS class for Input Method
 */

import { dataManager } from "./dataManager";
import { InputBoxLib } from "./inputboxLib";
import { KeyBoardLib } from "./keyboardLib";
import {
    KEYBOARD_TYPE,
    INPUTBOX_TYPE,
    BOUNDARY_Y,
    LINK_EVENT_TYPE,
} from "./styles";

const globalData = getApp()._options.globalData;

const logger = DeviceRuntimeCore.HmLogger.getLogger("inputMethod.js");

// InputMethod 输入法类
// 包含一个InputBox实例和一个Keyboard可选列表，通过一个control面板将触控事件分发给两个实例
export class InputMethod {
    constructor({ keyboard_list, inputbox_type, max_byte, text, title }) {
        if (keyboard_list == undefined) {
            this.keyboard_list = dataManager.json.keyboardList;
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
        this.inputbox = new InputBoxLib[inputbox_type]({
            father: this,
            text,
            title,
        });
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
                /* logger.debug("callbackM:"); */ this.touch(
                    hmUI.event.MOVE,
                    info
                );
            },
            (info) => {
                /* logger.debug("callbackMI:"); */ this.touch(
                    hmUI.event.MOVE_IN,
                    info
                );
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
                    input: this.inputbox.text,
                }),
            });
        }
    }
    delete() {
        // vibrate.stop();
    }
    getText() {
        return this.inputbox.text;
    }
    setText(text) {
        this.inputbox.text = text;
    }
    static KEYBOARD_TYPE = KEYBOARD_TYPE;
    static INPUTBOX_TYPE = INPUTBOX_TYPE;
}
