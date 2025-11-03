import { BaseKeyboard } from './BaseKeyboard.js';
import { KeyBoardCondition, KeyBoardConditionUtil } from '../../enums/KeyBoardCondition.js';
import { LinkEventType } from '../../enums/LinkEventType.js';

/**
 * 数字键盘实现
 * 布局参考手机数字键盘：1-9数字 + 0 + 删除/完成
 */
export class NumberKeyboard extends BaseKeyboard {
    constructor(config) {
        super(config);
        // 数字键盘特定的配置
        this.numberLayout = this.getNumberLayout();
        this.showDeleteButton = config.showDeleteButton !== false;
        this.showFinishButton = config.showFinishButton !== false;
    }

    onCreate() {
        // 数字键盘使用不同的布局，不需要功能栏
        this.createNumberBackground();
        this.createNumberButtons();
        this.createPressMask();
    }

    createNumberBackground() {
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

        // 数字键盘动画进入
        this.animateNumberEntry();
    }

    createNumberButtons() {
        const buttonWidth = px(80);
        const buttonHeight = px(50);
        const horizontalMargin = px(40);
        const verticalMargin = px(20);
        const startX = px(60);
        const startY = px(420);

        // 创建数字按钮 1-9
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const number = row * 3 + col + 1;
                this.createNumberButton(
                    number.toString(),
                    startX + col * (buttonWidth + horizontalMargin),
                    startY + row * (buttonHeight + verticalMargin),
                    buttonWidth,
                    buttonHeight
                );
            }
        }

        // 创建底部行按钮：0, 删除, 完成
        const bottomY = startY + 3 * (buttonHeight + verticalMargin);
        
        // 数字 0
        this.createNumberButton(
            "0",
            startX + buttonWidth + horizontalMargin,
            bottomY,
            buttonWidth,
            buttonHeight
        );

        // 删除按钮
        if (this.showDeleteButton) {
            this.createFunctionButton(
                "删除",
                startX,
                bottomY,
                buttonWidth,
                buttonHeight,
                LinkEventType.DELETE
            );
        }

        // 完成按钮
        if (this.showFinishButton) {
            this.createFunctionButton(
                "完成",
                startX + 2 * (buttonWidth + horizontalMargin),
                bottomY,
                buttonWidth,
                buttonHeight,
                LinkEventType.FINISH
            );
        }
    }

    createNumberButton(text, x, y, width, height) {
        const button = this.createWidget(hmUI.widget.TEXT, {
            x, y, w: width, h: height,
            text,
            text_size: px(28),
            color: 0xffffff,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V
        });

        // 添加边框
        this.createWidget(hmUI.widget.STROKE_RECT, {
            x, y, w: width, h: height,
            color: 0x444444,
            line_width: px(2),
            radius: px(6)
        });

        // 存储按钮信息用于触控检测
        if (!this.numberButtons) this.numberButtons = [];
        this.numberButtons.push({
            widget: button,
            text,
            area: { x, y, w: width, h: height },
            type: 'number'
        });
    }

    createFunctionButton(text, x, y, width, height, action) {
        const button = this.createWidget(hmUI.widget.TEXT, {
            x, y, w: width, h: height,
            text,
            text_size: px(24),
            color: action === LinkEventType.FINISH ? 0x28c4ff : 0xffffff,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V
        });

        // 功能按钮使用不同颜色的边框
        const borderColor = action === LinkEventType.FINISH ? 0x28c4ff : 0x666666;
        this.createWidget(hmUI.widget.STROKE_RECT, {
            x, y, w: width, h: height,
            color: borderColor,
            line_width: px(2),
            radius: px(6)
        });

        if (!this.numberButtons) this.numberButtons = [];
        this.numberButtons.push({
            widget: button,
            text,
            area: { x, y, w: width, h: height },
            type: 'function',
            action
        });
    }

    animateNumberEntry() {
        const startY = px(400);
        const endY = px(400); // 数字键盘从底部弹出
        const duration = 300;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // 弹性效果
            const elasticProgress = 1 - Math.pow(1 - progress, 2);
            const currentY = startY + (endY - startY) * elasticProgress;

            this.background.setProperty(hmUI.prop.Y, currentY);

            if (progress < 1) {
                timer.createTimer(16, 0, animate, {});
            }
        };
        animate();
    }

    // 重写触控处理方法
    handleTouch(event, info) {
        // 数字键盘不使用功能栏区域检测
        return this.handleKeyAreaTouch(event, info);
    }

    handleKeyAreaTouch(event, info) {
        const buttonIndex = this.getButtonIndex(info);

        switch (event) {
            case hmUI.event.CLICK_DOWN:
                return this.handleNumberKeyPress(buttonIndex);
            case hmUI.event.MOVE:
                return this.handleNumberKeyMove(buttonIndex);
            case hmUI.event.CLICK_UP:
                return this.handleNumberKeyRelease(buttonIndex);
            default:
                return null;
        }
    }

    getButtonIndex(info) {
        if (!this.numberButtons) return -1;

        for (let i = 0; i < this.numberButtons.length; i++) {
            const button = this.numberButtons[i];
            const area = button.area;
            
            if (info.x >= area.x && info.x <= area.x + area.w &&
                info.y >= area.y && info.y <= area.y + area.h) {
                return i;
            }
        }
        return -1;
    }

    handleNumberKeyPress(buttonIndex) {
        if (buttonIndex === -1) return null;

        this.condition = KeyBoardConditionUtil.addCondition(this.condition, KeyBoardCondition.PRESS);
        this.lastButton = { isFuncBar: false, index: buttonIndex };
        
        this.showNumberPressEffect(buttonIndex);
        
        const button = this.numberButtons[buttonIndex];
        
        // 立即响应数字输入（不需要长按）
        if (button.type === 'number') {
            return {
                type: LinkEventType.INPUT,
                data: button.text
            };
        } else if (button.type === 'function') {
            return this.handleFunctionButtonPress(button);
        }
        
        return null;
    }

    handleNumberKeyMove(buttonIndex) {
        if (buttonIndex === -1 || buttonIndex === this.lastButton.index) {
            return null;
        }

        // 清除之前的效果
        this.hidePressEffect();
        
        this.lastButton = { isFuncBar: false, index: buttonIndex };
        this.showNumberPressEffect(buttonIndex);
        
        const button = this.numberButtons[buttonIndex];
        if (button.type === 'number') {
            return {
                type: LinkEventType.CHANGE,
                data: button.text
            };
        }
        
        return null;
    }

    handleNumberKeyRelease(buttonIndex) {
        this.condition = KeyBoardConditionUtil.removeCondition(this.condition, KeyBoardCondition.PRESS);
        this.hidePressEffect();
        
        // 功能按钮在释放时触发
        if (buttonIndex !== -1) {
            const button = this.numberButtons[buttonIndex];
            if (button.type === 'function') {
                return this.handleFunctionButtonRelease(button);
            }
        }
        
        return null;
    }

    handleFunctionButtonPress(button) {
        // 功能按钮按下时只显示效果，不立即触发
        return null;
    }

    handleFunctionButtonRelease(button) {
        switch (button.action) {
            case LinkEventType.DELETE:
                return { type: LinkEventType.DELETE, data: 1 };
            case LinkEventType.FINISH:
                return { type: LinkEventType.FINISH };
            default:
                return null;
        }
    }

    showNumberPressEffect(buttonIndex) {
        const button = this.numberButtons[buttonIndex];
        const area = button.area;
        
        this.pressMask.border = {
            x: area.x,
            y: area.y,
            w: area.w,
            h: area.h
        };
        this.pressMask.widget.setProperty(hmUI.prop.MORE, this.pressMask.border);
        
        // 改变按钮文字颜色作为反馈
        const originalColor = button.widget.getProperty(hmUI.prop.COLOR);
        button.widget.setProperty(hmUI.prop.COLOR, 0x28c4ff);
        
        // 存储原始颜色以便恢复
        if (!this.originalColors) this.originalColors = new Map();
        this.originalColors.set(buttonIndex, originalColor);
    }

    hidePressEffect() {
        this.pressMask.border = { x: px(500), y: px(0) };
        this.pressMask.widget.setProperty(hmUI.prop.MORE, this.pressMask.border);
        
        // 恢复所有按钮的原始颜色
        if (this.originalColors) {
            this.originalColors.forEach((color, index) => {
                const button = this.numberButtons[index];
                if (button && button.widget) {
                    button.widget.setProperty(hmUI.prop.COLOR, color);
                }
            });
            this.originalColors.clear();
        }
    }

    getNumberLayout() {
        return {
            buttons: [
                // 第一行
                { text: "1", row: 0, col: 0 },
                { text: "2", row: 0, col: 1 },
                { text: "3", row: 0, col: 2 },
                // 第二行
                { text: "4", row: 1, col: 0 },
                { text: "5", row: 1, col: 1 },
                { text: "6", row: 1, col: 2 },
                // 第三行
                { text: "7", row: 2, col: 0 },
                { text: "8", row: 2, col: 1 },
                { text: "9", row: 2, col: 2 },
                // 第四行
                { text: "删除", row: 3, col: 0, type: "function", action: "delete" },
                { text: "0", row: 3, col: 1 },
                { text: "完成", row: 3, col: 2, type: "function", action: "finish" }
            ]
        };
    }

    // 数字键盘不需要选词功能
    chooseWord(input) {
        // 空实现
    }

    // 数字键盘不需要长按功能
    startLongPressTimer(index) {
        // 数字键盘不需要长按
    }

    handleLongPress(index) {
        // 数字键盘不需要长按
    }

    // 数字键盘不需要大小写切换
    toggleCapsLock() {
        // 空实现
    }

    onDestroy() {
        // 清理数字键盘特定的资源
        this.numberButtons = null;
        this.originalColors = null;
        super.onDestroy();
    }
}

/**
 * 符号键盘变体 - 基于数字键盘扩展
 */
export class SymbolKeyboard extends NumberKeyboard {
    constructor(config) {
        super(config);
        this.symbolLayout = this.getSymbolLayout();
    }

    getNumberLayout() {
        return this.getSymbolLayout();
    }

    getSymbolLayout() {
        return {
            buttons: [
                // 第一行
                { text: "!", row: 0, col: 0 },
                { text: "@", row: 0, col: 1 },
                { text: "#", row: 0, col: 2 },
                // 第二行
                { text: "$", row: 1, col: 0 },
                { text: "%", row: 1, col: 1 },
                { text: "&", row: 1, col: 2 },
                // 第三行
                { text: "*", row: 2, col: 0 },
                { text: "(", row: 2, col: 1 },
                { text: ")", row: 2, col: 2 },
                // 第四行
                { text: "-", row: 3, col: 0 },
                { text: "+", row: 3, col: 1 },
                { text: "=", row: 3, col: 2 }
            ]
        };
    }

    createNumberButtons() {
        const buttonWidth = px(80);
        const buttonHeight = px(50);
        const horizontalMargin = px(40);
        const verticalMargin = px(20);
        const startX = px(60);
        const startY = px(420);

        const layout = this.getSymbolLayout();

        layout.buttons.forEach(symbol => {
            this.createNumberButton(
                symbol.text,
                startX + symbol.col * (buttonWidth + horizontalMargin),
                startY + symbol.row * (buttonHeight + verticalMargin),
                buttonWidth,
                buttonHeight
            );
        });
    }
}

export default NumberKeyboard;