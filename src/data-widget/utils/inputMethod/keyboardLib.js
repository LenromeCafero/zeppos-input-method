import {
  BOUNDARY_Y,
  FUNCTION_BAR_H,
  BUTTON_LINE_SAFETY_DISTANCE,
  BUTTON_LINE_NUM,
  BUTTON_CAPSLOCK_UP_IMG,
  BUTTON_CAPSLOCK_DOWN_IMG,
  FUNCTION_BAR_IMG_STYLE,
  BACKGROUND_IMG_STYLE,
  BUTTON_IMG_STYLE,
  PRESS_MASK_STYLE,
  CHOOSE_WORD_TEXT_STYLE,
  QWERT_LAYOUT,
  QWERT_LAYOUT_STYLE,
} from "./styles";
import { LINK_EVENT_TYPE, KeyBoardCondition, InputboxCondition } from "./enums";
import { Fx } from "../fx";
import * as hmUI from "@zos/ui";

import { pinyin_dict_notone } from "./pinyin_dict_notone";

import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
const { width, screenShape } = getDeviceInfo();

class BaseKeyboard {
  constructor({ father }) {
    this.background = null;
    this.functionBar = null;
    this.functionBarWidgets = [];
    this.buttonImg = null;
    this.buttonLineSafeDistance = BUTTON_LINE_SAFETY_DISTANCE;
    this.buttonLineNum = BUTTON_LINE_NUM;
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
    this.longPressTimeoutID = null;
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
      this.buttonImg.setProperty(hmUI.prop.SRC, BUTTON_CAPSLOCK_UP_IMG);
    } else {
      this.buttonImg.setProperty(hmUI.prop.SRC, BUTTON_CAPSLOCK_DOWN_IMG);
    }
  }
  getKeyIndex(isFuncBar, info) {
    if (isFuncBar) {
    } else {
      let min0 = (x) => (x < 0 ? 0 : x);
      let maxBorder = (x, border) => (x > border ? border : x);
      switch (Math.floor((info.y - BOUNDARY_Y - FUNCTION_BAR_H) / px(60))) {
        case 0:
          return maxBorder(
            min0(
              Math.floor((info.x - this.buttonLineSafeDistance[0]) / px(46)),
            ),
            9,
          );
        case 1:
          return (
            maxBorder(
              min0(
                Math.floor((info.x - this.buttonLineSafeDistance[1]) / px(46)),
              ),
              8,
            ) + 10
          );
        case 2:
          return (
            maxBorder(
              min0(
                Math.floor((info.x - this.buttonLineSafeDistance[2]) / px(46)),
              ),
              6,
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
    const {
      KEY_WIDTH,
      KEY_HEIGHT,
      KEY_SPACING,
      KEY_PADDING,
      ROW_START_Y,
      ROW1_OFFSET_Y,
      ROW2_OFFSET_Y,
      ROW3_OFFSET_Y,
      ROW4_OFFSET_Y,
      KEYS_PER_ROW1,
      KEYS_PER_ROW2,
      KEYS_PER_ROW3,
      CAPSLOCK_WIDTH,
      CAPSLOCK_HEIGHT,
      SPACE_WIDTH,
      SPACE_HEIGHT,
      DELETE_WIDTH,
      DELETE_HEIGHT,
      CAPSLOCK_X,
      SPACE_X,
      DELETE_X,
    } = QWERT_LAYOUT_STYLE;

    switch (isFuncBar) {
      case true:
        break;
      case false:
        if (index < KEYS_PER_ROW1) {
          return {
            x:
              this.buttonLineSafeDistance[0] +
              KEY_PADDING +
              KEY_SPACING * index,
            y: ROW_START_Y + ROW1_OFFSET_Y,
            w: KEY_WIDTH,
            h: KEY_HEIGHT,
          };
        } else if (index < KEYS_PER_ROW1 + KEYS_PER_ROW2) {
          return {
            x:
              this.buttonLineSafeDistance[1] +
              KEY_PADDING +
              KEY_SPACING * (index - KEYS_PER_ROW1),
            y: ROW_START_Y + ROW2_OFFSET_Y,
            w: KEY_WIDTH,
            h: KEY_HEIGHT,
          };
        } else if (index < KEYS_PER_ROW1 + KEYS_PER_ROW2 + KEYS_PER_ROW3) {
          return {
            x:
              this.buttonLineSafeDistance[2] +
              KEY_PADDING +
              KEY_SPACING * (index - KEYS_PER_ROW1 - KEYS_PER_ROW2),
            y: ROW_START_Y + ROW3_OFFSET_Y,
            w: KEY_WIDTH,
            h: KEY_HEIGHT,
          };
        } else {
          switch (index) {
            case 26:
              return {
                x: CAPSLOCK_X,
                y: ROW4_OFFSET_Y,
                w: CAPSLOCK_WIDTH,
                h: CAPSLOCK_HEIGHT,
              }; // CapsLock
            case 27:
              return {
                x: SPACE_X,
                y: ROW4_OFFSET_Y,
                w: SPACE_WIDTH,
                h: SPACE_HEIGHT,
              }; // Space
            case 28:
              return {
                x: DELETE_X,
                y: ROW4_OFFSET_Y,
                w: DELETE_WIDTH,
                h: DELETE_HEIGHT,
              }; // Delete
          }
        }
    }
  }
  longPress() {
    clearTimeout(this.longPressTimeoutID);
    this.longPressTimeoutID = null;
    if (this.lastButton.isFuncBar) {
      // 工具栏
    } else {
      // 按键
      if (this.lastButton.index < 26) {
        this.father.link(true, {
          event: LINK_EVENT_TYPE.CHANGE,
          data: QWERT_LAYOUT.NumberAndSymbol[this.lastButton.index],
        });
        this.chooseWord("");
      } else {
        switch (this.lastButton.index) {
          case 26:
            break; //TODO capslock
          case 27:
            break; // space
          case 28: // delete
            this.longPressTimeoutID = setTimeout(() => {
              if (!(this.condition & KeyBoardCondition.PRESS)) return;

              this.father.link(true, {
                event: LINK_EVENT_TYPE.DELETE,
                data: 1,
              });

              const interval = setInterval(() => {
                if (this.condition & KeyBoardCondition.PRESS) {
                  this.father.link(true, {
                    event: LINK_EVENT_TYPE.DELETE,
                    data: 1,
                  });
                } else {
                  clearInterval(interval);
                }
              }, 180);
            }, 5);
            break;
        }
      }
    }
  }
  onCreate() {
    // 新建功能栏
    this.functionBar = hmUI.createWidget(
      hmUI.widget.IMG,
      FUNCTION_BAR_IMG_STYLE,
    );
    new Fx({
      begin: px(400) - FUNCTION_BAR_H,
      end: BOUNDARY_Y,
      fps: 60,
      time: 0.2,
      style: Fx.Styles.EASE_IN_QUAD,
      enable: true,
      func: (res) => {
        this.functionBar.setProperty(hmUI.prop.MORE, {
          y: res,
          pos_y: 0 - res,
        });
      },
      onStop() {},
    });
    // 创建背景
    this.background = hmUI.createWidget(hmUI.widget.IMG, BACKGROUND_IMG_STYLE);
    this.buttonImg = hmUI.createWidget(hmUI.widget.IMG, BUTTON_IMG_STYLE);
    new Fx({
      begin: px(400),
      end: BOUNDARY_Y + FUNCTION_BAR_H,
      fps: 60,
      time: 0.2,
      style: Fx.Styles.EASE_IN_QUAD,
      enable: true,
      func: (res) => {
        this.background.setProperty(hmUI.prop.MORE, {
          y: res,
          pos_y: 0 - res,
        });
        this.buttonImg.setProperty(hmUI.prop.Y, res);
      },

      onStop() {},
    });

    this.pressMask.widget = hmUI.createWidget(
      hmUI.widget.STROKE_RECT,
      PRESS_MASK_STYLE,
    );
    this.chooseWordText.widget = hmUI.createWidget(hmUI.widget.TEXT, {
      ...CHOOSE_WORD_TEXT_STYLE,
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
          if (this.longPressTimeoutID) {
            clearTimeout(this.longPressTimeoutID);
          }
          this.condition &= ~KeyBoardCondition.PRESS; // 清除此状态位
          let temp = hmUI.createWidget(hmUI.widget.STROKE_RECT, {
            ...this.pressMask.border,
            color: 0xee6666,
            line_width: px(3),
            radius: 6,
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
                Fx.getMixColor(0xee6666, 0x555555, res),
              ),
            onStop: () => {
              hmUI.deleteWidget(temp);
            },
          });
          this.pressMask.border = { x: px(500), y: px(0) };
          this.pressMask.widget.setProperty(
            hmUI.prop.MORE,
            this.pressMask.border,
          );

          break;
        case hmUI.event.MOVE_OUT:
        case hmUI.event.MOVE_IN:
        case hmUI.event.MOVE:
          if (index < 26) {
            // input letter
            this.condition |= KeyBoardCondition.PRESS;

            if (this.lastButton.index != index && !this.lastButton.isFuncBar) {
              if (this.longPressTimeoutID) {
                clearTimeout(this.longPressTimeoutID);
              }
              let border = this.getKeyBorder(false, index);
              this.pressMask.border = border;
              this.pressMask.widget.setProperty(hmUI.prop.MORE, border);
              this.lastButton.isFuncBar = false;
              this.lastButton.index = index;

              this.longPressTimeoutID = setTimeout(() => {
                this.longPress();
              }, 600);
              this.chooseWord(
                this.capsLock
                  ? QWERT_LAYOUT.Letters.Capital[index]
                  : QWERT_LAYOUT.Letters.LowerCase[index],
              );
              return {
                event: LINK_EVENT_TYPE.CHANGE,
                data: this.capsLock
                  ? QWERT_LAYOUT.Letters.Capital[index]
                  : QWERT_LAYOUT.Letters.LowerCase[index],
              };
            }
          } else {
            // press func
            if (this.lastButton.index != index && !this.lastButton.isFuncBar) {
              let border = this.getKeyBorder(false, index);
              this.pressMask.border = border;
              this.pressMask.widget.setProperty(hmUI.prop.MORE, border);

              this.lastButton.isFuncBar = false;
              this.lastButton.index = index;

              this.longPressTimeoutID = setTimeout(() => {
                this.longPress();
              }, 300);
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
          this.lastButton.isFuncBar = false;
          this.lastButton.index = index;

          this.longPressTimeoutID = setTimeout(() => {
            this.longPress();
          }, 300);
          this.condition |= KeyBoardCondition.PRESS;
          if (index < 26) {
            // input letter
            let border = this.getKeyBorder(false, index);
            this.pressMask.widget.setProperty(hmUI.prop.MORE, border);
            this.pressMask.border = border;

            this.chooseWord(
              this.capsLock
                ? QWERT_LAYOUT.Letters.Capital[index]
                : QWERT_LAYOUT.Letters.LowerCase[index],
            );
            return {
              event: LINK_EVENT_TYPE.INPUT,
              data: this.capsLock
                ? QWERT_LAYOUT.Letters.Capital[index]
                : QWERT_LAYOUT.Letters.LowerCase[index],
            };
          } else {
            // press func
            let border = this.getKeyBorder(false, index);
            this.pressMask.widget.setProperty(hmUI.prop.MORE, border);
            this.pressMask.border = border;
            switch (index) {
              case 26: // capsLock
                this.setCapsLock(!this.capsLock);
                break;
              case 27: // space
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
  chooseWord(inputText) {}
  updateChooseWord(event, info) {}
  onDelete() {}
  link(event) {}
}
export const KeyBoardLib = {
  EN: class EN extends BaseKeyboard {},
  NUM: class NUM {},
  ZH_CN_PY: class ZH_CN_PY extends BaseKeyboard {
    chooseWord(inputText) {
      console.log("[chooseWord] inputText:", inputText);
      const currentInput = this.father.getText();
      console.log("[chooseWord] 当前输入框内容:", currentInput);
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
        (a, b) => b.length - a.length,
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
        },
      ).width;

      this.chooseWordText.border.x = 0;
      this.chooseWordText.widget.setProperty(hmUI.prop.MORE, {
        x: this.chooseWordText.border.x,
        w: this.chooseWordText.border.w,
        text: this.chooseWordArray.join("  "),
      });
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
            const spaceWidth = px(14);
            let currentStart = 0;
            for (let i = 0; i < this.chooseWordArray.length; i++) {
              const word = this.chooseWordArray[i];
              const { width: wordWidth } = hmUI.getTextLayout(word, {
                text_size: px(30),
                text_width: 0,
                wrapped: 0,
              });
              const wordEnd = currentStart + wordWidth;
              if (
                info.x - this.chooseWordText.border.x >= currentStart &&
                info.x - this.chooseWordText.border.x < wordEnd
              ) {
                const match = this.father.getText().match(/[a-z]+$/i);
                const pinyinPart = match ? match[0] : "";
                if (pinyinPart === "") {
                  return;
                }
                const updatedInput = this.father
                  .getText()
                  .slice(0, -pinyinPart.length);
                this.father.setText(updatedInput);
                this.chooseWordArray = [];
                this.chooseWordText.widget.setProperty(hmUI.prop.MORE, {
                  text: this.chooseWordArray.join("  "),
                });
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
};
