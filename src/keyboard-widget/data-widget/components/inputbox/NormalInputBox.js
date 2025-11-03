import { BaseInputBox } from './BaseInputBox.js';
import { InputboxCondition, InputboxConditionUtil } from '../../enums/InputboxCondition.js';

/**
 * 普通输入框实现 - 基于旧代码的NORMAL类
 */
export class NormalInputBox extends BaseInputBox {
    constructor(config) {
        super(config);
        // 普通输入框使用基类的默认配置
    }

    // 普通输入框直接使用基类实现，不需要重写方法
    // 这里可以添加特定于普通输入框的自定义逻辑

    onCreate() {
        super.onCreate();
        
        // 普通输入框可以添加额外的装饰元素
        this.createAdditionalDecorations();
    }

    createAdditionalDecorations() {
        // 添加输入框边框
        this.borderWidget = this.createWidget(hmUI.widget.STROKE_RECT, {
            x: this.border.x - px(2),
            y: this.border.y - px(2),
            w: this.border.w + px(4),
            h: this.border.h + px(4),
            color: 0x444444,
            line_width: px(2),
            radius: px(12)
        });
    }

    // 普通输入框可以重写特定行为
    handleInput(char) {
        if (this.text.length >= this.maxLength) {
            // 达到最大长度时的反馈
            this.showMaxLengthWarning();
            return;
        }
        
        super.handleInput(char);
    }

    showMaxLengthWarning() {
        // 显示长度限制提示
        const warning = this.createWidget(hmUI.widget.TEXT, {
            x: this.border.x,
            y: this.border.y - px(30),
            w: this.border.w,
            h: px(25),
            text: `最多输入${this.maxLength}个字符`,
            text_size: px(20),
            color: 0xff6b6b,
            align_h: hmUI.align.CENTER_H
        });

        // 2秒后自动隐藏
        timer.createTimer(2000, 0, () => {
            if (warning && !this.isDestroyed) {
                hmUI.deleteWidget(warning);
            }
        }, {});
    }

    onDestroy() {
        // 普通输入框特定的清理逻辑
        super.onDestroy();
    }
}