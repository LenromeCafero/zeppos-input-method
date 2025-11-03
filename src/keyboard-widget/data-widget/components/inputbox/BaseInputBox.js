import { UIComponent } from '../ui/UIComponent.js';
import { InputboxCondition, InputboxConditionUtil } from '../../enums/InputboxCondition.js';
import { LinkEventType } from '../../enums/LinkEventType.js';
import { Cursor } from '../ui/Cursor.js';
import { TextLine } from '../ui/TextLine.js';

export class BaseInputBox extends UIComponent {
    constructor(config) {
        super();
        this.father = config.father;
        this.text = config.text || "";
        this.title = config.title || "请输入";
        this.maxLength = config.maxLength || 100;
        this.theme = config.theme || {};

        this.condition = InputboxCondition.NORMAL;
        this.charAt = 0;
        this.lastTouch = { x: 0, y: 0 };

        this.border = { x: px(50), y: px(100), w: px(285), h: px(70) };
        this.safetyDistance = px(20);
        this.beginSafetyDistance = px(18);
    }

    onCreate() {
        this.createBackground();
        this.createTitle();
        this.createTextLine();
        this.createCursor();
        this.createFinishButton();
    }

    createBackground() {
        if (this.theme.background?.type === "img") {
            this.backgroundWidget = this.createWidget(hmUI.widget.IMG, {
                x: px(0), y: px(0), src: this.theme.background.src
            });
        } else {
            this.backgroundWidget = this.createWidget(hmUI.widget.FILL_RECT, {
                ...this.border,
                color: this.theme.background?.color || 0x2a2a2a,
                radius: px(10)
            });
        }
    }

    createTitle() {
        this.titleWidget = this.createWidget(hmUI.widget.TEXT, {
            x: px(110), y: px(25), w: px(260), h: px(40),
            color: 0xeeeeee, text_size: px(38),
            text: this.title,
            align_h: hmUI.align.CENTER_H, align_v: hmUI.align.CENTER_V
        });
    }

    createTextLine() {
        this.textLine = new TextLine({
            text: this.text,
            border: this.border,
            text_size: px(45),
            color: 0xffffff,
            beginSafetyDistance: this.beginSafetyDistance,
            safetyDistance: this.safetyDistance
        });
        this.textLine.onCreate();
        this.widgets.push(...this.textLine.widgets);
    }

    createCursor() {
        this.cursor = new Cursor({
            border: this.border,
            line_width: px(4),
            locX: this.beginSafetyDistance,
            line_height: px(40),
            color: 0x28c4ff
        });
        this.cursor.onCreate();
        this.widgets.push(...this.cursor.widgets);
    }

    createFinishButton() {
        this.btnTextWidget = this.createWidget(hmUI.widget.TEXT, {
            x: px(335), y: px(105), w: px(80), h: px(55),
            text: "完成",
            text_size: px(35),
            color: this.theme.finishBtn?.normal_color || 0xffffff,
            align_h: hmUI.align.CENTER_H, align_v: hmUI.align.CENTER_V
        });
    }

    onTouch(event, info) {
        switch (event) {
            case hmUI.event.CLICK_DOWN:
                return this.handleClickDown(info);
            case hmUI.event.CLICK_UP:
                return this.handleClickUp(info);
            case hmUI.event.MOVE:
                return this.handleMove(info);
            case hmUI.event.MOVE_OUT:
                return this.handleMoveOut();
            default:
                return null;
        }
    }

    handleClickDown(info) {
        if (this.isInTextArea(info)) {
            this.condition = InputboxConditionUtil.addCondition(
                this.condition, InputboxCondition.PRESS
            );
            this.lastTouch = { x: info.x, y: info.y };
        } else if (this.isInFinishButton(info)) {
            this.animateFinishButtonPress();
            return { type: LinkEventType.FINISH };
        }
        return null;
    }

    handleClickUp(info) {
        if (InputboxConditionUtil.hasCondition(this.condition, InputboxCondition.PRESS) &&
            !InputboxConditionUtil.hasCondition(this.condition, InputboxCondition.MOVE) &&
            this.isInTextArea(info)) {
            
            this.charAt = this.textLine.getIndexFromOffsetX(info.x - this.border.x);
            this.cursor.move(
                this.textLine.getOffsetXFromIndex(this.charAt),
                true
            );
        }
        
        this.condition = InputboxCondition.NORMAL;
        return null;
    }

    handleMove(info) {
        if (InputboxConditionUtil.hasCondition(this.condition, InputboxCondition.PRESS)) {
            this.condition = InputboxConditionUtil.addCondition(
                this.condition, InputboxCondition.MOVE
            );
            
            const deltaX = info.x - this.lastTouch.x;
            this.textLine.setLocX(this.textLine.locX - deltaX);
            this.cursor.move(
                this.textLine.getOffsetXFromIndex(this.charAt),
                false
            );
            
            this.lastTouch.x = info.x;
            this.lastTouch.y = info.y;
        }
        return null;
    }

    handleMoveOut() {
        this.condition = InputboxCondition.NORMAL;
        return null;
    }

    link(data) {
        switch (data.type) {
            case LinkEventType.INPUT:
                this.handleInput(data.data);
                break;
            case LinkEventType.DELETE:
                this.handleDelete(data.data);
                break;
            case LinkEventType.CHANGE:
                this.handleChange(data.data);
                break;
        }
        this.updateCursorPosition();
    }

    handleInput(char) {
        if (this.text.length >= this.maxLength) return;
        
        this.text = this.text.substring(0, this.charAt) + char + 
                   this.text.substring(this.charAt);
        this.charAt++;
        this.textLine.setText(this.text);
    }

    handleDelete(count) {
        if (this.text.length === 0 || this.charAt === 0) return;
        
        this.text = this.text.substring(0, this.charAt - 1) + 
                   this.text.substring(this.charAt);
        this.charAt--;
        this.textLine.setText(this.text);
    }

    handleChange(char) {
        if (this.text.length === 0 || this.charAt === 0) return;
        
        this.text = this.text.substring(0, this.charAt - 1) + char + 
                   this.text.substring(this.charAt);
        this.textLine.setText(this.text);
    }

    updateCursorPosition() {
        let offset = this.textLine.getOffsetXFromIndex(this.charAt);
        
        if (offset < this.safetyDistance && this.textLine.textTotalWidth > this.safetyDistance) {
            this.textLine.setLocX(this.textLine.locX + offset - this.safetyDistance);
            offset = this.safetyDistance;
        } else if (offset > this.border.w - this.safetyDistance) {
            this.textLine.setLocX(
                this.textLine.locX + offset - this.border.w + this.safetyDistance
            );
            offset = this.border.w - this.safetyDistance;
        }
        
        this.cursor.move(offset, true);
    }

    isInTextArea(info) {
        return info.x >= this.border.x && info.x <= this.border.x + this.border.w &&
               info.y >= this.border.y && info.y <= this.border.y + this.border.h;
    }

    isInFinishButton(info) {
        return info.x >= px(335) && info.x <= px(415) &&
               info.y >= px(105) && info.y <= px(160);
    }

    animateFinishButtonPress() {
        // 按钮按下动画
        const normalColor = this.theme.finishBtn?.normal_color || 0xffffff;
        const pressColor = this.theme.finishBtn?.press_color || 0x28c4ff;
        
        this.btnTextWidget.setProperty(hmUI.prop.COLOR, pressColor);
        timer.createTimer(200, 0, () => {
            this.btnTextWidget.setProperty(hmUI.prop.COLOR, normalColor);
        }, {});
    }

    getText() {
        return this.text;
    }

    setText(text) {
        this.text = text;
        this.charAt = Math.min(this.charAt, text.length);
        this.textLine.setText(text);
        this.updateCursorPosition();
    }

    onDestroy() {
        if (this.textLine) this.textLine.destroy();
        if (this.cursor) this.cursor.destroy();
    }
}