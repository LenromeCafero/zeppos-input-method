// 类中包含
// onCreate()
// onTouch(event, info) 若位置不在范围内event为MOVE_OUT 返回值为输入类型
// 返回值
// onDelete()
// link() inputbox和keyboard之间的通信事件处理

import {
    BOUNDARY_Y,
    FUNCTION_BAR_H,
    LINK_EVENT_TYPE,
    KeyBoardCondition,
    QWERT_Layout,
} from "./styles";
import { click } from "./method";
import { Fx } from "../fx";
import { dataManager } from "./dataManager";

import { pinyin_dict_notone } from "./pinyin_dict_notone";

import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device'
const { width, screenShape } = getDeviceInfo()

class BaseKeyboard {
    constructor({ singleKeyboard, father }) {
        this.singleKeyboard = singleKeyboard;
        this.background = null;
        this.functionBar = null;
        this.functionBarWidgets = [];
        this.buttonImg = null;
        this.buttonLineSafeDistance = [10, 33, 79, null];
        this.buttonLineNum = 4;
        this.moreKeyTimer = null;
        this.condition = KeyBoardCondition.FREE;
        this.capsLock = false;
        this.father = father;
        this.waitWordLength = 0;
        this.pressMask = {
            widget: null,
            border: { x: 0, y: 0, w: 0, h: 0 },
        };
        this.lastButton = {
            isFuncBar: false,
            index: -1,
        };
        this.longPressTimer = null;
        this.chooseWordText = {
            widget: null,
            border: { x: 0, y: 0, w: 0, h: 0 },
        };
        this.chooseWordArray = [];
        this.lastTouch = { x: 0, y: 0 };
    }

    setCapsLock(bLock) {
        this.capsLock = bLock;
        if (bLock) {
            this.buttonImg.setProperty(
                hmUI.prop.SRC,
                "image/keyboardEN_button_Earth_UP.png"
            );
        } else {
            this.buttonImg.setProperty(
                hmUI.prop.SRC,
                "image/keyboardEN_button_Earth.png"
            );
        }
    }
    getKeyIndex(isFuncBar, info) {
        if (isFuncBar) {
        } else {
            let min0 = (x) => (x < 0 ? 0 : x);
            let maxBorder = (x, border) => (x > border ? border : x);
            switch (
                Math.floor((info.y - BOUNDARY_Y - FUNCTION_BAR_H) / px(60))
            ) {
                case 0:
                    return maxBorder(
                        min0(
                            Math.floor(
                                (info.x - this.buttonLineSafeDistance[0]) /
                                    px(46)
                            )
                        ),
                        9
                    );
                case 1:
                    return (
                        maxBorder(
                            min0(
                                Math.floor(
                                    (info.x - this.buttonLineSafeDistance[1]) /
                                        px(46)
                                )
                            ),
                            8
                        ) + 10
                    );
                case 2:
                    return (
                        maxBorder(
                            min0(
                                Math.floor(
                                    (info.x - this.buttonLineSafeDistance[2]) /
                                        px(46)
                                )
                            ),
                            6
                        ) + 19
                    );
                case 3:
                    if (info.x <= 175) {
                        // CapsLock
                        return 26;
                    } else if (info.x < 305) {
                        // space
                        return 27;
                    } else {
                        // Delete
                        return 28;
                    }
            }
        }
    }
    getKeyBorder(isFuncBar, index) {
        switch (isFuncBar) {
            case true:
                break;
            case false:
                if (index < 10)
                    return {
                        x:
                            this.buttonLineSafeDistance[0] +
                            px(4) +
                            px(46) * index,
                        y: BOUNDARY_Y + FUNCTION_BAR_H + px(5),
                        w: px(38),
                        h: px(50),
                    };
                else if (index < 19)
                    return {
                        x:
                            this.buttonLineSafeDistance[1] +
                            px(4) +
                            px(46) * (index - 10),
                        y: BOUNDARY_Y + FUNCTION_BAR_H + px(65),
                        w: px(38),
                        h: px(50),
                    };
                else if (index < 26)
                    return {
                        x:
                            this.buttonLineSafeDistance[2] +
                            px(4) +
                            px(46) * (index - 19),
                        y: BOUNDARY_Y + FUNCTION_BAR_H + px(125),
                        w: px(38),
                        h: px(50),
                    };
                else {
                    switch (index) {
                        case 26:
                            return {
                                x: px(83),
                                y: px(425),
                                w: px(92),
                                h: px(48),
                            }; // CapsLock
                        case 27:
                            return {
                                x: px(180),
                                y: px(425),
                                w: px(120),
                                h: px(47),
                            }; // Space
                        case 28:
                            return {
                                x: px(305),
                                y: px(425),
                                w: px(92),
                                h: px(48),
                            }; // Delete
                    }
                }
        }
    }

    longPress() {
        timer.stopTimer(this.longPressTimer);
        this.longPressTimer = null;
        if (this.lastButton.isFuncBar) {
            // 工具栏
        } else {
            // 按键
            if (this.lastButton.index < 26) {
                click();

                this.father.link(true, {
                    event: LINK_EVENT_TYPE.CHANGE,
                    data: QWERT_Layout.NumberAndSymbol[this.lastButton.index],
                });
                this.chooseWord("");
            } else {
                switch (this.lastButton.index) {
                    case 26:
                        break; //TODO capslock
                    case 27:
                        break; // space
                    case 28: // delete
                        console.debug("timer for delete! create");
                        this.longPressTimer = timer.createTimer(
                            5,
                            dataManager.json.delTimeMs,
                            (option) => {
                                console.debug("timer for delete! callback");

                                if (this.condition & KeyBoardCondition.PRESS) {
                                    click();
                                    this.father.link(true, {
                                        event: LINK_EVENT_TYPE.DELETE,
                                        data: 1,
                                    });
                                } else {
                                    timer.stopTimer(this.longPressTimer);
                                }
                            },
                            {}
                        );
                        break;
                }
            }
        }
    }
    onCreate() {
        // 新建功能栏
        if (SCREEN_SHAPE_SQUARE) {
            // 圆屏
            if (dataManager.json.theme.keyboard.functionBar.type == "rect") {
                this.functionBar = hmUI.createWidget(hmUI.widget.FILL_RECT, {
                    x: px(0),
                    y: px(400),
                    w: px(480),
                    h: px(480) - BOUNDARY_Y,
                    color: dataManager.json.theme.keyboard.functionBar.color,
                    radius: px(0),
                });
            } else if (
                dataManager.json.theme.keyboard.functionBar.type == "img"
            ) {
                this.functionBar = hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(0),
                    y: px(400),
                    w: px(480),
                    h: px(480) - BOUNDARY_Y,
                    pos_x: 0,
                    pos_y: 0 - px(400),
                    src: dataManager.json.theme.keyboard.functionBar.src,
                });
            }
            new Fx({
                begin: px(400) - FUNCTION_BAR_H,
                end: BOUNDARY_Y,
                fps: 60,
                time: 0.2,
                style: Fx.Styles.EASE_IN_QUAD,
                enable: true,
                func: (res) => {
                    if (
                        dataManager.json.theme.keyboard.functionBar.type ==
                        "img"
                    ) {
                        this.functionBar.setProperty(hmUI.prop.MORE, {
                            y: res,
                            pos_y: 0 - res,
                        });
                    } else if (
                        dataManager.json.theme.keyboard.functionBar.type ==
                        "rect"
                    ) {
                        this.functionBar.setProperty(hmUI.prop.Y, res);
                    }
                },
                onStop() {
                    /* console.debug("functionBar onStop") */
                },
            });
        }
        // 创建背景
        if (SCREEN_SHAPE_SQUARE) {
            // 圆屏
            if (dataManager.json.theme.keyboard.background.type == "rect") {
                this.background = hmUI.createWidget(hmUI.widget.FILL_RECT, {
                    x: px(0),
                    y: px(400),
                    w: px(480),
                    h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
                    color: dataManager.json.theme.keyboard.background.color,
                    radius: px(0),
                });
            } else if (
                dataManager.json.theme.keyboard.background.type == "img"
            ) {
                this.background = hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(0),
                    y: px(400),
                    w: px(480),
                    h: px(480) - BOUNDARY_Y - FUNCTION_BAR_H,
                    pos_x: 0,
                    pos_y: 0 - px(400),
                    src: dataManager.json.theme.keyboard.background.src,
                });
            }
            this.buttonImg = hmUI.createWidget(hmUI.widget.IMG, {
                x: px(0),
                y: px(400),
                w: px(480),
                h: px(240),
                src: dataManager.json.theme.keyboard.button.src,
            });
            new Fx({
                begin: px(400),
                end: BOUNDARY_Y + FUNCTION_BAR_H,
                fps: 60,
                time: 0.2,
                style: Fx.Styles.EASE_IN_QUAD,
                enable: true,
                func: (res) => {
                    if (
                        dataManager.json.theme.keyboard.background.type == "img"
                    ) {
                        this.background.setProperty(hmUI.prop.MORE, {
                            y: res,
                            pos_y: 0 - res,
                        });
                    } else if (
                        dataManager.json.theme.keyboard.background.type ==
                        "rect"
                    ) {
                        this.background.setProperty(hmUI.prop.Y, res);
                    }
                    this.buttonImg.setProperty(hmUI.prop.Y, res);
                },

                onStop() {
                    /* console.debug("background onStop") */
                },
            });
        } else {
            // 方屏
            // TODO
        }

        // 创建按钮遮罩
        this.pressMask.widget = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
            x: px(500),
            y: px(0),
            w: px(42),
            h: px(50),
            color: dataManager.json.theme.keyboard.button.press_color,
            line_width: px(3),
            radius: dataManager.json.theme.keyboard.button.radius,
        });
        this.chooseWordText.widget = hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: px(190),
            w: px(480),
            h: BOUNDARY_Y,
            color: 0xffffff,
            text_size: px(30),
            text: this.chooseWordArray.join("  "),
        });
        this.chooseWordText.widget.setEnable(false);
    }
    onTouch(event, info) {
        if (info.y < BOUNDARY_Y + FUNCTION_BAR_H) {
          return this.updateChooseWord(event, info);
            // 选词栏
        } else {
            // 键盘
            let index = this.getKeyIndex(false, info);

            switch (event) {
                case hmUI.event.CLICK_UP:
                    if (this.longPressTimer) {
                        timer.stopTimer(this.longPressTimer);
                    }
                    this.condition &= ~KeyBoardCondition.PRESS; // 清除此状态位
                    let temp = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
                        ...this.pressMask.border,
                        color: dataManager.json.theme.keyboard.button
                            .press_color,
                        line_width: px(3),
                        radius: dataManager.json.theme.keyboard.button.radius,
                    });
                    new Fx({
                        begin: 0,
                        end: 1.0,
                        style: Fx.Styles.EASE_OUT_QUAD,
                        fps: 30,
                        time: 0.1,
                        enable: true,
                        func: (res) =>
                            temp.setProperty(
                                hmUI.prop.COLOR,
                                Fx.getMixColor(
                                    dataManager.json.theme.keyboard.button
                                        .press_color,
                                    dataManager.json.theme.keyboard.button
                                        .color,
                                    res
                                )
                            ),
                        onStop: () => {
                            hmUI.deleteWidget(temp);
                        },
                    });
                    this.pressMask.border = { x: px(500), y: px(0) };
                    this.pressMask.widget.setProperty(
                        hmUI.prop.MORE,
                        this.pressMask.border
                    );

                    break;
                case hmUI.event.MOVE_OUT:
                case hmUI.event.MOVE_IN:
                case hmUI.event.MOVE: ///////////////////////
                    if (index < 26) {
                        // input letter
                        this.condition |= KeyBoardCondition.PRESS;

                        if (
                            this.lastButton.index != index &&
                            !this.lastButton.isFuncBar
                        ) {
                            if (this.longPressTimer) {
                                timer.stopTimer(this.longPressTimer);
                            }
                            let border = this.getKeyBorder(false, index);
                            this.pressMask.border = border;
                            this.pressMask.widget.setProperty(
                                hmUI.prop.MORE,
                                border
                            );
                            click();
                            this.lastButton.isFuncBar = false;
                            this.lastButton.index = index;
                            if (this.longPressTimer) {
                                timer.stopTimer(this.longPressTimer);
                            }
                            this.longPressTimer = timer.createTimer(
                                dataManager.json.longPressMsAfterMove,
                                2147483648,
                                (option) => this.longPress(),
                                {}
                            );
                            this.chooseWord(
                                this.capsLock
                                    ? QWERT_Layout.Letters.Capital[index]
                                    : QWERT_Layout.Letters.LowerCase[index]
                            );
                            return {
                                event: LINK_EVENT_TYPE.CHANGE,
                                data: this.capsLock
                                    ? QWERT_Layout.Letters.Capital[index]
                                    : QWERT_Layout.Letters.LowerCase[index],
                            };
                        }
                    } else {
                        // press func
                        if (
                            this.lastButton.index != index &&
                            !this.lastButton.isFuncBar
                        ) {
                            let border = this.getKeyBorder(false, index);
                            this.pressMask.border = border;
                            this.pressMask.widget.setProperty(
                                hmUI.prop.MORE,
                                border
                            );

                            this.lastButton.isFuncBar = false;
                            this.lastButton.index = index;
                            if (this.longPressTimer) {
                                timer.stopTimer(this.longPressTimer);
                            }
                            this.longPressTimer = timer.createTimer(
                                dataManager.json.longPressMs,
                                2147483648,
                                (option) => this.longPress(),
                                {}
                            );
                            switch (index) {
                                case 26: // capsLock
                                    //this.setCapsLock(!this.capsLock);
                                    break;
                                case 27: // space
                                    return {
                                        event: LINK_EVENT_TYPE.CHANGE,
                                        data: " ",
                                    };
                                    break;
                                case 28: // delete
                                    this.chooseWord("DELETE");
                                    return {
                                        event: LINK_EVENT_TYPE.DELETE,
                                        data: 1,
                                    };
                            }
                        }
                    }
                    this.KeyBoardCondition = KeyBoardCondition.WAIT_WORD;
                    break;
                case hmUI.event.CLICK_DOWN:
                    click();
                    this.lastButton.isFuncBar = false;
                    this.lastButton.index = index;
                    if (this.longPressTimer) {
                        timer.stopTimer(this.longPressTimer);
                    }
                    this.longPressTimer = timer.createTimer(
                        dataManager.json.longPressMs,
                        2147483648,
                        (option) => this.longPress(),
                        {}
                    );
                    this.condition |= KeyBoardCondition.PRESS;
                    if (index < 26) {
                        // input letter
                        let border = this.getKeyBorder(false, index);
                        this.pressMask.widget.setProperty(
                            hmUI.prop.MORE,
                            border
                        );
                        this.pressMask.border = border;

                        this.chooseWord(
                            this.capsLock
                                ? QWERT_Layout.Letters.Capital[index]
                                : QWERT_Layout.Letters.LowerCase[index]
                        );
                        return {
                            event: LINK_EVENT_TYPE.INPUT,
                            data: this.capsLock
                                ? QWERT_Layout.Letters.Capital[index]
                                : QWERT_Layout.Letters.LowerCase[index],
                        };
                    } else {
                        // press func
                        let border = this.getKeyBorder(false, index);
                        this.pressMask.widget.setProperty(
                            hmUI.prop.MORE,
                            border
                        );
                        this.pressMask.border = border;
                        switch (index) {
                            case 26: // capsLock
                                this.setCapsLock(!this.capsLock);
                                break;
                            case 27: // space
                                // if (this.condition && KeyBoardCondition.WAIT_WORD) this.chooseWord(0)
                                // else
                                return {
                                    event: LINK_EVENT_TYPE.INPUT,
                                    data: " ",
                                };
                            case 28: // delete
                                this.chooseWord("DELETE");
                                return {
                                    event: LINK_EVENT_TYPE.DELETE,
                                    data: 1,
                                };
                        }
                    }
                    break;
            }
        }
    }
    chooseWord(inputText) {
        // Example
        // switch (inputText) {
        //     case "DELETE":
        //         inputText = this.father.getText().slice(0, -1);
        //         break;
        //     case "":
        //         this.chooseWordArray = [];
        //         break;
        //     default:
        //         inputText = this.father.getText() + inputText;
        //         break;
        // }
    }
    updateChooseWord(event, info) {
      switch (event) {
        case hmUI.event.CLICK_DOWN:
            this.condition = KeyBoardCondition.PRESS;
            this.lastTouch.x = info.x;
            break;

        case hmUI.event.MOVE:
            if (
                this.condition &
                (KeyBoardCondition.PRESS | KeyBoardCondition.WAIT_WORD)
            ) {
                const deltaX = info.x - this.lastTouch.x;
                this.chooseWordText.border.x += deltaX;
                this.chooseWordText.widget.setProperty(hmUI.prop.MORE, {
                    x: this.chooseWordText.border.x,
                    w: this.chooseWordText.border.w,
                });

                this.lastTouch.x = info.x;

                this.condition = KeyBoardCondition.WAIT_WORD;
            }
            break;

        case hmUI.event.CLICK_UP:
            if (this.condition === KeyBoardCondition.PRESS) {
                const { width: spaceWidth } = hmUI.getTextLayout("  ", {
                    text_size: px(30),
                    text_width: 0,
                    wrapped: 0,
                });

                let currentStart = 0;
                for (let i = 0; i < this.chooseWordArray.length; i++) {
                    const word = this.chooseWordArray[i];
                    const { width: wordWidth } = hmUI.getTextLayout(
                        word,
                        {
                            text_size: px(30),
                            text_width: 0,
                            wrapped: 0,
                        }
                    );

                    const wordEnd = currentStart + wordWidth;

                    if (
                        info.x - this.chooseWordText.border.x >=
                            currentStart &&
                        info.x - this.chooseWordText.border.x < wordEnd
                    ) {
                        const match = this.father
                            .getText()
                            .match(/[a-z]+$/i);
                        const pinyinPart = match ? match[0] : ""; // 提取的拼音部分
                        if (pinyinPart === "") {
                            return;
                        }
                        const updatedInput = this.father
                            .getText()
                            .slice(0, -pinyinPart.length);
                        this.father.setText(updatedInput);
                        this.chooseWordArray = [];
                        this.chooseWordText.widget.setProperty(
                            hmUI.prop.MORE,
                            {
                                text: this.chooseWordArray.join("  "),
                            }
                        );
                        return {
                            event: LINK_EVENT_TYPE.INPUT,
                            data: word,
                        };
                    }

                    currentStart = wordEnd + spaceWidth;
                }
            }

            this.condition = KeyBoardCondition.FREE;
            break;
    }

    }
    onDelete() {}
    link(event) {}
}
export const KeyBoardLib = [
    class EN extends BaseKeyboard {},
    class NUM {},
    class ZH_CN_PY extends BaseKeyboard {
        chooseWord(inputText) {
            const currentInput = this.father.getText();
            console.debug("[chooseWord] 当前输入框内容:", currentInput);
            if (inputText === "DELETE") {
                const updatedInput = currentInput.slice(0, -1);

                if (updatedInput === "") {
                    this.chooseWordArray = [];

                    this.chooseWordText.border.x = 0;
                    this.chooseWordText.border.w = 0;
                    this.chooseWordText.widget.setProperty(hmUI.prop.MORE, {
                        x: this.chooseWordText.border.x,
                        w: this.chooseWordText.border.w,
                        text: this.chooseWordArray.join("  "),
                    });
                    return;
                }
                inputText = updatedInput;
            } else {
                inputText = currentInput + inputText;
            }

            const pinyinPart = this.extractPinyin(inputText);

            const sortedKeys = Object.keys(pinyin_dict_notone).sort(
                (a, b) => b.length - a.length
            );

            let matched = false;
            for (const key of sortedKeys) {
                if (pinyinPart.startsWith(key)) {
                    this.chooseWordArray = Array.from(pinyin_dict_notone[key]);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                this.chooseWordArray = [];
            }

            this.chooseWordText.border.w = hmUI.getTextLayout(
                this.chooseWordArray.join("  "),
                {
                    text_size: px(30),
                    text_width: 0,
                    wrapped: 0,
                }
            ).width;

            this.chooseWordText.border.x = 0;
            this.chooseWordText.widget.setProperty(hmUI.prop.MORE, {
                x: this.chooseWordText.border.x,
                w: this.chooseWordText.border.w,
                text: this.chooseWordArray.join("  "),
            });
        }

        extractPinyin(inputText) {
            let pinyinPart = "";
            for (let i = inputText.length - 1; i >= 0; i--) {
                const char = inputText[i];
                if (/[a-z]/i.test(char)) {
                    pinyinPart = char + pinyinPart;
                } else {
                    break;
                }
            }
            return pinyinPart;
        }
    },
];
