import { BaseInputBox } from './BaseInputBox.js';

/**
 * 搜索输入框实现 - 带搜索图标和清除按钮
 */
export class SearchInputBox extends BaseInputBox {
    constructor(config) {
        super(config);
        this.showClearButton = config.showClearButton !== false;
        this.searchIcon = config.searchIcon || "🔍";
        this.placeholder = config.placeholder || "搜索...";
        this.onSearch = config.onSearch; // 搜索回调函数
    }

    onCreate() {
        // 搜索框使用不同的样式
        this.border = { x: px(30), y: px(80), w: px(420), h: px(60) };
        
        super.onCreate();
        this.createSearchIcon();
        this.createClearButton();
        this.updateClearButtonVisibility();
    }

    createBackground() {
        // 搜索框使用圆角背景
        this.backgroundWidget = this.createWidget(hmUI.widget.FILL_RECT, {
            ...this.border,
            color: 0x2a2a2a,
            radius: px(30)
        });

        // 搜索框边框
        this.borderWidget = this.createWidget(hmUI.widget.STROKE_RECT, {
            x: this.border.x - px(1),
            y: this.border.y - px(1),
            w: this.border.w + px(2),
            h: this.border.h + px(2),
            color: 0x444444,
            line_width: px(1),
            radius: px(30)
        });
    }

    createSearchIcon() {
        this.searchIconWidget = this.createWidget(hmUI.widget.TEXT, {
            x: this.border.x + px(15),
            y: this.border.y,
            w: px(40),
            h: this.border.h,
            text: this.searchIcon,
            text_size: px(24),
            color: 0x888888,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V
        });
    }

    createClearButton() {
        if (this.showClearButton) {
            this.clearButton = this.createWidget(hmUI.widget.TEXT, {
                x: this.border.x + this.border.w - px(45),
                y: this.border.y,
                w: px(40),
                h: this.border.h,
                text: "×",
                text_size: px(28),
                color: 0x888888,
                align_h: hmUI.align.CENTER_H,
                align_v: hmUI.align.CENTER_V
            });
        }
    }

    createTextLine() {
        // 调整文本区域，为图标留出空间
        const textBorder = {
            ...this.border,
            x: this.border.x + px(50),
            w: this.border.w - px(100) // 为图标和清除按钮留出空间
        };

        this.textLine = new TextLine({
            text: this.text,
            border: textBorder,
            text_size: px(24),
            color: 0xffffff,
            beginSafetyDistance: this.beginSafetyDistance,
            safetyDistance: this.safetyDistance
        });
        this.textLine.onCreate();
        this.widgets.push(...this.textLine.widgets);

        // 显示占位符文本
        if (!this.text) {
            this.showPlaceholder();
        }
    }

    showPlaceholder() {
        this.placeholderWidget = this.createWidget(hmUI.widget.TEXT, {
            x: this.border.x + px(50),
            y: this.border.y,
            w: this.border.w - px(100),
            h: this.border.h,
            text: this.placeholder,
            text_size: px(24),
            color: 0x666666,
            align_v: hmUI.align.CENTER_V
        });
    }

    hidePlaceholder() {
        if (this.placeholderWidget) {
            hmUI.deleteWidget(this.placeholderWidget);
            this.placeholderWidget = null;
        }
    }

    createFinishButton() {
        // 搜索框不使用完成按钮，使用搜索功能代替
        // 可以添加搜索按钮或使用键盘的完成按钮
    }

    handleInput(char) {
        if (this.text.length >= this.maxLength) return;
        
        super.handleInput(char);
        this.hidePlaceholder();
        this.updateClearButtonVisibility();
        this.triggerSearch();
    }

    handleDelete(count) {
        super.handleDelete(count);
        this.updateClearButtonVisibility();
        
        if (this.text.length === 0) {
            this.showPlaceholder();
        } else {
            this.triggerSearch();
        }
    }

    handleClickDown(info) {
        // 检查是否点击了清除按钮
        if (this.isInClearButton(info) && this.text.length > 0) {
            this.clearText();
            return null;
        }
        
        // 检查是否点击了搜索图标（执行搜索）
        if (this.isInSearchIcon(info) && this.text.length > 0) {
            this.executeSearch();
            return null;
        }
        
        return super.handleClickDown(info);
    }

    isInClearButton(info) {
        return this.clearButton && 
               info.x >= this.border.x + this.border.w - px(45) &&
               info.x <= this.border.x + this.border.w - px(5) &&
               info.y >= this.border.y && info.y <= this.border.y + this.border.h;
    }

    isInSearchIcon(info) {
        return info.x >= this.border.x + px(15) &&
               info.x <= this.border.x + px(55) &&
               info.y >= this.border.y && info.y <= this.border.y + this.border.h;
    }

    clearText() {
        this.text = "";
        this.charAt = 0;
        this.textLine.setText("");
        this.showPlaceholder();
        this.updateClearButtonVisibility();
        this.updateCursorPosition();
        
        // 触发空搜索
        this.triggerSearch();
    }

    updateClearButtonVisibility() {
        if (this.clearButton) {
            const visible = this.text.length > 0;
            this.clearButton.setProperty(hmUI.prop.VISIBLE, visible);
        }
    }

    triggerSearch() {
        // 防抖搜索，避免频繁触发
        if (this.searchTimer) {
            timer.stopTimer(this.searchTimer);
        }
        
        this.searchTimer = timer.createTimer(300, 0, () => {
            this.executeSearch();
        }, {});
    }

    executeSearch() {
        if (this.onSearch) {
            this.onSearch(this.text);
        }
        
        // 也可以触发完成事件
        this.father.eventBus.emit('search_executed', {
            query: this.text,
            timestamp: Date.now()
        });
    }

    // 搜索框可以添加搜索历史等功能
    showSearchHistory() {
        // 实现搜索历史显示逻辑
    }

    onDestroy() {
        if (this.searchTimer) {
            timer.stopTimer(this.searchTimer);
        }
        super.onDestroy();
    }
}