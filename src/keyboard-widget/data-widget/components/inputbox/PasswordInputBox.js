import { BaseInputBox } from './BaseInputBox.js';

/**
 * 密码输入框实现 - 显示*号代替实际字符
 */
export class PasswordInputBox extends BaseInputBox {
    constructor(config) {
        super(config);
        this.actualText = config.text || ""; // 存储实际文本
        this.maskChar = config.maskChar || "•"; // 掩码字符
        this.showLastChar = config.showLastChar !== false; // 是否显示最后一个字符
        this.showLastCharTimeout = null;
    }

    onCreate() {
        // 密码框使用不同的标题和样式
        if (!this.title.includes("密码")) {
            this.title = "输入密码";
        }
        
        super.onCreate();
        this.createSecurityIndicator();
    }

    createSecurityIndicator() {
        // 密码强度指示器
        this.securityIndicator = this.createWidget(hmUI.widget.TEXT, {
            x: this.border.x,
            y: this.border.y + this.border.h + px(5),
            w: this.border.w,
            h: px(20),
            text: this.getSecurityLevelText(),
            text_size: px(18),
            color: this.getSecurityLevelColor(),
            align_h: hmUI.align.RIGHT
        });
    }

    // 重写文本显示逻辑
    getDisplayText() {
        if (this.actualText.length === 0) return "";
        
        if (this.showLastChar && this.showLastCharTimeout) {
            // 显示最后一个字符
            const masked = this.maskChar.repeat(Math.max(0, this.actualText.length - 1));
            return masked + this.actualText.charAt(this.actualText.length - 1);
        } else {
            // 全部显示为掩码
            return this.maskChar.repeat(this.actualText.length);
        }
    }

    // 重写输入处理
    handleInput(char) {
        if (this.actualText.length >= this.maxLength) return;
        
        this.actualText = this.actualText.substring(0, this.charAt) + char + 
                         this.actualText.substring(this.charAt);
        this.charAt++;
        
        this.updateDisplayText();
        this.updateSecurityIndicator();
        
        // 显示最后一个字符一段时间
        this.showLastCharacterTemporarily();
    }

    handleDelete(count) {
        if (this.actualText.length === 0 || this.charAt === 0) return;
        
        this.actualText = this.actualText.substring(0, this.charAt - 1) + 
                         this.actualText.substring(this.charAt);
        this.charAt--;
        
        this.updateDisplayText();
        this.updateSecurityIndicator();
    }

    handleChange(char) {
        if (this.actualText.length === 0 || this.charAt === 0) return;
        
        this.actualText = this.actualText.substring(0, this.charAt - 1) + char + 
                         this.actualText.substring(this.charAt);
        
        this.updateDisplayText();
        this.updateSecurityIndicator();
    }

    updateDisplayText() {
        this.text = this.getDisplayText();
        this.textLine.setText(this.text);
    }

    showLastCharacterTemporarily() {
        // 清除之前的定时器
        if (this.showLastCharTimeout) {
            timer.stopTimer(this.showLastCharTimeout);
        }
        
        if (this.showLastChar && this.actualText.length > 0) {
            // 更新显示文本（显示最后一个字符）
            this.updateDisplayText();
            
            // 1秒后恢复掩码显示
            this.showLastCharTimeout = timer.createTimer(1000, 0, () => {
                this.showLastCharTimeout = null;
                this.updateDisplayText();
            }, {});
        }
    }

    updateSecurityIndicator() {
        if (this.securityIndicator) {
            this.securityIndicator.setProperty(hmUI.prop.TEXT, this.getSecurityLevelText());
            this.securityIndicator.setProperty(hmUI.prop.COLOR, this.getSecurityLevelColor());
        }
    }

    getSecurityLevelText() {
        const length = this.actualText.length;
        if (length === 0) return "";
        if (length < 4) return "弱";
        if (length < 8) return "中";
        return "强";
    }

    getSecurityLevelColor() {
        const length = this.actualText.length;
        if (length === 0) return 0x666666;
        if (length < 4) return 0xff6b6b; // 红色
        if (length < 8) return 0xffa502; // 橙色
        return 0x2ed573; // 绿色
    }

    // 重写获取文本方法，返回实际文本
    getText() {
        return this.actualText;
    }

    setText(text) {
        this.actualText = text;
        this.charAt = Math.min(this.charAt, text.length);
        this.updateDisplayText();
        this.updateSecurityIndicator();
        this.updateCursorPosition();
    }

    // 密码框可以添加切换显示/隐藏的功能
    toggleVisibility() {
        this.showLastChar = !this.showLastChar;
        this.updateDisplayText();
        
        // 更新按钮文本
        if (this.toggleButton) {
            this.toggleButton.setProperty(hmUI.prop.TEXT, this.showLastChar ? "隐藏" : "显示");
        }
    }

    createFinishButton() {
        super.createFinishButton();
        
        // 添加显示/隐藏切换按钮
        this.toggleButton = this.createWidget(hmUI.widget.TEXT, {
            x: px(250), y: px(105), w: px(80), h: px(55),
            text: "显示",
            text_size: px(24),
            color: 0x28c4ff,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V
        });
    }

    handleClickDown(info) {
        // 检查是否点击了切换按钮
        if (this.isInToggleButton(info)) {
            this.toggleVisibility();
            return null;
        }
        
        return super.handleClickDown(info);
    }

    isInToggleButton(info) {
        return info.x >= px(250) && info.x <= px(330) &&
               info.y >= px(105) && info.y <= px(160);
    }

    onDestroy() {
        if (this.showLastCharTimeout) {
            timer.stopTimer(this.showLastCharTimeout);
        }
        super.onDestroy();
    }
}