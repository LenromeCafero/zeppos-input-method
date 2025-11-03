import { UIComponent } from '../ui/UIComponent.js';
import { KeyBoardCondition, KeyBoardConditionUtil } from '../../enums/KeyBoardCondition.js';
import { LinkEventType } from '../../enums/LinkEventType.js';
import { BOUNDARY_Y, FUNCTION_BAR_H, QWERT_Layout } from './layouts/QwertyLayout.js';

export class BaseKeyboard extends UIComponent {
    constructor(config) {
        super();
        this.father = config.father;
        this.singleKeyboard = config.singleKeyboard || false;
        this.theme = config.theme || {};
        
        this.condition = KeyBoardCondition.FREE;
        this.lastButton = { isFuncBar: false, index: -1 };
        this.longPressTimer = null;
        this.pressMask = { widget: null, border: { x: 0, y: 0, w: 0, h: 0 } };
        this.lastTouch = { x: 0, y: 0 };
        
        this.buttonLineSafeDistance = [px(10), px(33), px(79), null];
    }

    onCreate() {
        this.createBackground();
        this.createFunctionBar();
        this.createPressMask();
        this.createChooseWordArea();
    }

    createBackground() {
        if (this.theme.background?.type === "img") {
            this.background = this.createWidget(hmUI.widget.IMG, {
                x: px(0), y: px(400), w: px(480), h: px(240),
                src: this.theme.background.src,
                pos_y: px(-400)
            });
        } else {
            this.background = this.createWidget(hmUI.widget.FILL_RECT, {
                x: px(0), y: px(400), w: px(480), h: px(240),
                color: this.theme.background?.color || 0x1a1a1a
            });
        }

        this.buttonImg = this.createWidget(hmUI.widget.IMG, {
            x: px(0), y: px(400), w: px(480), h: px(240),
            src: this.theme.button?.src
        });

        // 动画进入
        this.animateEntry();
    }

    createFunctionBar() {
        if (this.theme.functionBar?.type === "img") {
            this.functionBar = this.createWidget(hmUI.widget.IMG, {
                x: px(0), y: px(400), w: px(480), h: px(80),
                src: this.theme.functionBar.src,
                pos_y: px(-400)
            });
        } else {
            this.functionBar = this.createWidget(hmUI.widget.FILL_RECT, {
                x: px(0), y: px(400), w: px(480), h: px(80),
                color: this.theme.functionBar?.color || 0x2a2a2a
            });
        }
    }

    createPressMask() {
        this.pressMask.widget = this.createWidget(hmUI.widget.STROKE_RECT, {
            x: px(500), y: px(0), w: px(42), h: px(50),
            color: this.theme.button?.press_color || 0x28c4ff,
            line_width: px(3),
            radius: this.theme.button?.radius || px(8)
        });
    }

    createChooseWordArea() {
        this.chooseWordText = {
            widget: this.createWidget(hmUI.widget.TEXT, {
                x: px(0), y: px(340), w: px(480), h: px(60),
                color: 0xffffff,
                text_size: px(30),
                text: ""
            }),
            border: { x: 0, y: px(340), w: 0, h: px(60) }
        };
    }

    animateEntry() {
        // 简化的动画实现
        const startY = px(400);
        const endY = BOUNDARY_Y + FUNCTION_BAR_H;
        const duration = 200;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentY = startY + (endY - startY) * progress;

            this.background.setProperty(hmUI.prop.Y, currentY);
            this.buttonImg.setProperty(hmUI.prop.Y, currentY);
            this.functionBar.setProperty(hmUI.prop.Y, currentY - FUNCTION_BAR_H);

            if (progress < 1) {
                timer.createTimer(16, 0, animate, {});
            }
        };
        animate();
    }

    onTouch(event, info) {
        this.preTouch(event, info);
        const result = this.handleTouch(event, info);
        this.postTouch(event, info, result);
        return result;
    }

    preTouch(event, info) {
        if (event === hmUI.event.CLICK_DOWN) {
            this.lastTouch = { x: info.x, y: info.y };
        }
    }

    postTouch(event, info, result) {
        // 后处理逻辑
    }

    handleTouch(event, info) {
        if (info.y < BOUNDARY_Y + FUNCTION_BAR_H) {
            return this.handleFunctionBarTouch(event, info);
        } else {
            return this.handleKeyAreaTouch(event, info);
        }
    }

    handleKeyAreaTouch(event, info) {
        const index = this.getKeyIndex(false, info);

        switch (event) {
            case hmUI.event.CLICK_DOWN:
                return this.handleKeyPress(index);
            case hmUI.event.MOVE:
                return this.handleKeyMove(index);
            case hmUI.event.CLICK_UP:
                return this.handleKeyRelease();
            default:
                return null;
        }
    }

    handleKeyPress(index) {
        this.condition = KeyBoardConditionUtil.addCondition(this.condition, KeyBoardCondition.PRESS);
        this.lastButton = { isFuncBar: false, index };
        
        this.showPressEffect(index);
        this.startLongPressTimer(index);
        
        if (index < 26) {
            // 字母键
            const char = this.getCharacter(index);
            this.chooseWord(char);
            return {
                type: LinkEventType.INPUT,
                data: char
            };
        } else {
            // 功能键
            return this.handleFunctionKeyPress(index);
        }
    }

    handleKeyMove(index) {
        if (this.lastButton.index !== index || this.lastButton.isFuncBar) {
            this.lastButton = { isFuncBar: false, index };
            this.showPressEffect(index);
            this.restartLongPressTimer();
            
            if (index < 26) {
                const char = this.getCharacter(index);
                this.chooseWord(char);
                return {
                    type: LinkEventType.CHANGE,
                    data: char
                };
            }
        }
        return null;
    }

    handleKeyRelease() {
        this.condition = KeyBoardConditionUtil.removeCondition(this.condition, KeyBoardCondition.PRESS);
        this.hidePressEffect();
        this.stopLongPressTimer();
        return null;
    }

    handleFunctionKeyPress(index) {
        switch (index) {
            case 26: // CapsLock
                this.toggleCapsLock();
                return null;
            case 27: // Space
                return { type: LinkEventType.INPUT, data: " " };
            case 28: // Delete
                this.chooseWord("DELETE");
                return { type: LinkEventType.DELETE, data: 1 };
            default:
                return null;
        }
    }

    handleFunctionBarTouch(event, info) {
        // 功能栏触控处理
        return null;
    }

    getKeyIndex(isFuncBar, info) {
        if (isFuncBar) {
            // 功能栏索引计算
            return -1;
        }

        const row = Math.floor((info.y - BOUNDARY_Y - FUNCTION_BAR_H) / px(60));
        const baseX = this.buttonLineSafeDistance[row];

        switch (row) {
            case 0: return Math.min(Math.max(Math.floor((info.x - baseX) / px(46)), 0), 9);
            case 1: return Math.min(Math.max(Math.floor((info.x - baseX) / px(46)), 0), 8) + 10;
            case 2: return Math.min(Math.max(Math.floor((info.x - baseX) / px(46)), 0), 6) + 19;
            case 3:
                if (info.x <= px(175)) return 26;      // CapsLock
                else if (info.x < px(305)) return 27;  // Space
                else return 28;                        // Delete
            default: return -1;
        }
    }

    getKeyBorder(index) {
        // 按键边界计算 (同旧代码逻辑)
        if (index < 10) {
            return {
                x: this.buttonLineSafeDistance[0] + px(4) + px(46) * index,
                y: BOUNDARY_Y + FUNCTION_BAR_H + px(5),
                w: px(38), h: px(50)
            };
        } else if (index < 19) {
            return {
                x: this.buttonLineSafeDistance[1] + px(4) + px(46) * (index - 10),
                y: BOUNDARY_Y + FUNCTION_BAR_H + px(65),
                w: px(38), h: px(50)
            };
        } else if (index < 26) {
            return {
                x: this.buttonLineSafeDistance[2] + px(4) + px(46) * (index - 19),
                y: BOUNDARY_Y + FUNCTION_BAR_H + px(125),
                w: px(38), h: px(50)
            };
        } else {
            switch (index) {
                case 26: return { x: px(83), y: px(425), w: px(92), h: px(48) };
                case 27: return { x: px(180), y: px(425), w: px(120), h: px(47) };
                case 28: return { x: px(305), y: px(425), w: px(92), h: px(48) };
            }
        }
    }

    showPressEffect(index) {
        const border = this.getKeyBorder(index);
        this.pressMask.border = border;
        this.pressMask.widget.setProperty(hmUI.prop.MORE, border);
    }

    hidePressEffect() {
        this.pressMask.border = { x: px(500), y: px(0) };
        this.pressMask.widget.setProperty(hmUI.prop.MORE, this.pressMask.border);
    }

    startLongPressTimer(index) {
        this.stopLongPressTimer();
        this.longPressTimer = timer.createTimer(500, 2147483648, () => {
            this.handleLongPress(index);
        }, {});
    }

    restartLongPressTimer() {
        this.stopLongPressTimer();
        this.longPressTimer = timer.createTimer(300, 2147483648, () => {
            this.handleLongPress(this.lastButton.index);
        }, {});
    }

    stopLongPressTimer() {
        if (this.longPressTimer) {
            timer.stopTimer(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    handleLongPress(index) {
        if (index < 26) {
            // 字母键长按显示符号
            const symbol = QWERT_Layout.NumberAndSymbol[index];
            this.father.link(true, {
                type: LinkEventType.CHANGE,
                data: symbol
            });
        } else if (index === 28) {
            // 删除键长按连续删除
            this.father.link(true, {
                type: LinkEventType.DELETE,
                data: 1
            });
        }
    }

    getCharacter(index) {
        if (this.capsLock) {
            return QWERT_Layout.Letters.Capital[index];
        } else {
            return QWERT_Layout.Letters.LowerCase[index];
        }
    }

    toggleCapsLock() {
        this.capsLock = !this.capsLock;
        if (this.capsLock) {
            this.buttonImg.setProperty(hmUI.prop.SRC, this.theme.button?.src_up);
        } else {
            this.buttonImg.setProperty(hmUI.prop.SRC, this.theme.button?.src);
        }
    }

    chooseWord(input) {
        // 基础实现，子类重写
        this.updateChooseWordDisplay([]);
    }

    updateChooseWordDisplay(words) {
        const text = words.join("  ");
        this.chooseWordText.widget.setProperty(hmUI.prop.TEXT, text);
        
        const textWidth = hmUI.getTextLayout(text, {
            text_size: px(30),
            text_width: 0,
            wrapped: 0
        }).width;
        
        this.chooseWordText.border.w = textWidth;
        this.chooseWordText.widget.setProperty(hmUI.prop.MORE, {
            x: this.chooseWordText.border.x,
            w: this.chooseWordText.border.w
        });
    }

    link(data) {
        // 处理来自输入框的通信
    }

    onDestroy() {
        this.stopLongPressTimer();
    }
}
class EnglishKeyboard extends BaseKeyboard {} //英文键盘
class NumberKeyboard extends BaseKeyboard {} //数字键盘  
class ChinesePinyinKeyboard extends BaseKeyboard {} //中文拼音键盘
class SymbolKeyboard extends BaseKeyboard {} //符号键盘