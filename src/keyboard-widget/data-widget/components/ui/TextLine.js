import { UIComponent } from './UIComponent.js';

export class TextLine extends UIComponent {
    constructor(config) {
        super();
        this.text = config.text || "";
        this.border = config.border;
        this.textSize = config.textSize || px(45);
        this.color = config.color || 0xffffff;
        this.beginSafetyDistance = config.beginSafetyDistance || px(18);
        
        this.locX = 0 - this.beginSafetyDistance;
        this.charBegin = 0;
        this.charEnd = 0;
        this.offsetBegin = 0;
        this.offsetEnd = 0;
        this.textWList = [];
        this.textTotalWidth = 0;
        this.leftWidth = this.border.w - (config.safetyDistance || px(20));
        this.textShow = this.text;
        
        this.calculateTextMetrics();
    }
    
    calculateTextMetrics() {
        this.textWList = [];
        this.textTotalWidth = 0;
        
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text.charAt(i);
            const width = hmUI.getTextLayout(char, {
                text_size: this.textSize,
                text_width: 0,
                wrapped: 0
            }).width;
            this.textWList.push(width);
            this.textTotalWidth += width;
        }
    }
    
    onCreate() {
        this.widget = this.createWidget(hmUI.widget.TEXT, {
            ...this.border,
            text_size: this.textSize,
            color: this.color,
            text: this.text,
            align_v: hmUI.align.CENTER_V
        });
    }
    
    getOffsetXFromIndex(index) {
        let absoluteX = 0;
        for (let i = 0; i < index && i < this.textWList.length; i++) {
            absoluteX += this.textWList[i];
        }
        return absoluteX - this.locX;
    }
    
    getIndexFromOffsetX(offsetX) {
        if (offsetX < 0 || offsetX > this.border.w || this.text.length === 0) {
            return 0;
        }
        
        let tempX = this.offsetBegin * -1;
        for (let i = this.charBegin; i < this.text.length; i++) {
            tempX += this.textWList[i];
            if (tempX >= offsetX) return i;
        }
        return this.text.length;
    }
    
    setText(text) {
        this.text = text;
        this.calculateTextMetrics();
        this.setLocX(this.locX); // 重新计算显示位置
    }
    
    setLocX(locX) {
        const maxLocX = this.textTotalWidth - this.border.w + this.leftWidth;
        if (locX > maxLocX) locX = maxLocX;
        if (locX < 0 - this.beginSafetyDistance) {
            locX = 0 - this.beginSafetyDistance;
        }
        
        this.locX = locX;
        
        // 计算开始字符位置
        let tempX = 0;
        for (this.charBegin = 0; this.charBegin < this.text.length; this.charBegin++) {
            tempX += this.textWList[this.charBegin];
            if (tempX >= locX) break;
        }
        
        if (this.charBegin >= this.text.length) {
            this.charBegin = this.text.length - 1;
        }
        
        this.offsetBegin = this.textWList[this.charBegin] - (tempX - locX);
        
        // 计算结束字符位置
        this.charEnd = this.charBegin;
        if (this.charEnd < this.text.length - 1 && tempX - locX < this.border.w) {
            for (this.charEnd++; this.charEnd < this.text.length; this.charEnd++) {
                tempX += this.textWList[this.charEnd];
                if (tempX - locX >= this.border.w) break;
            }
        }
        
        this.offsetEnd = tempX - locX - this.border.w;
        this.textShow = this.text.substring(this.charBegin, this.charEnd + 1);
        
        if (this.widget) {
            this.widget.setProperty(hmUI.widget.MORE, {
                x: this.border.x - this.offsetBegin,
                w: this.border.w + this.offsetBegin + this.offsetEnd,
                text: this.textShow
            });
        }
    }
}