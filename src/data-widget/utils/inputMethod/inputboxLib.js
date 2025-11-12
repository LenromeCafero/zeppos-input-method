// 类中包含
// onCreate()
// onTouch(event, info) 若位置不在范围内event为MOVE_OUT 返回值为输入类型
// onDelete()

import { dataManager } from "./dataManager";
import { Fx } from "../fx";
import { click } from "./method";
import { LINK_EVENT_TYPE,InputboxCondition } from "./styles";


// 光标类 用于控制光标的位置与动画
class Cursor {
    constructor({ border, line_width, locX, line_height, color }) {
        this.widget = null;
        this.border = border;
        this.line_width = line_width;
        this.locX = locX;
        this.line_height = line_height;
        this.color = color;
        this.fxInstance = null;
        this.flashTimer = null;
        this.flashShowing = true;
        this.offsetX = -2; //为了防止字符与光标重叠的偏移
    }
    setFlash(enable) {
        // 闪烁
        if (enable) {
            if (!this.flashTimer) {
                this.flashTimer = this.flashTimer = timer.createTimer(
                    150,
                    350,
                    (option) => {
                        if (this.flashShowing) {
                            this.widget.setProperty(
                                hmUI.prop.VISIBLE,
                                (this.flashShowing = false)
                            );
                        } else {
                            this.widget.setProperty(
                                hmUI.prop.VISIBLE,
                                (this.flashShowing = true)
                            );
                        }
                    },
                    {}
                );
            }
        } else {
            // if enable
            if (this.flashTimer) {
                timer.stopTimer(this.flashTimer);
                this.flashTimer = null;
            }
            this.widget.setProperty(hmUI.prop.VISIBLE, true);
        }
    }
    onCreate() {
        this.widget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: this.border.x + this.locX + this.offsetX,
            y: this.border.y + (this.border.h - this.line_height) / 2,
            w: this.line_width,
            h: this.line_height,
            color: this.color,
            radius: px(2),
        });
        this.setFlash(true);
    }
    move(locX, useFx) {
        if (useFx) {
            this.setFlash(false);
            if (this.fxInstance) {
                this.fxInstance.setEnable(false);
            }
            this.fxInstance = new Fx({
                begin: this.locX,
                end: locX,
                fps: 60,
                time: 0.1,
                style: Fx.Styles.EASE_IN_QUAD,
                enable: true,
                func: (x) => {
                    this.widget.setProperty(
                        hmUI.prop.X,
                        x + this.border.x + this.offsetX
                    );
                    this.locX = x;
                },
                onStop: () => {
                    this.fxInstance = null;
                    this.setFlash(true);
                },
            });
        } else {
            if (this.fxInstance) {
                this.fxInstance.setEnable(false);
            }
            this.locX = locX;
            this.widget.setProperty(
                hmUI.prop.X,
                locX + this.border.x + this.offsetX
            );
        }
    }
}
// 文字行类 用于控制文字的位置与动画
class TextLine {
    constructor({ text, border, text_size, color, beginSafetyDistance }) {
        text || (text = "");
        this.text = text;
        this.border = border;
        this.text_size = text_size;
        this.color = color;
        this.widget = null;
        this.beginSafetyDistance = beginSafetyDistance;
        this.locX = 0 - this.beginSafetyDistance; // 实际文字行的x坐标对文字框的相对x坐标
        this.textLength = text.length;
        this.charBegin = 0;
        this.charEnd = 0;
        this.offsetBegin = 0;
        this.offsetEnd = 0;
        this.offsetBegin = 0;
        this.offsetEnd = 0;
        this.textWList = new Array(this.textLength);
        this.textTotalWidth = 0;
        this.leftWidth = this.border.w - px(40); // safetyDistance
        this.textShow = text;
        for (let i = 0, width = 0; i < text.length; ++i) {
            width = hmUI.getTextLayout(text.charAt(i), {
                text_size,
                text_width: 0,
                wrapped: 0,
            }).width;
            this.textWList[i] = width;
            this.textTotalWidth += width;
        }
    }
    onCreate() {
        this.widget = hmUI.createWidget(hmUI.widget.TEXT, {
            ...this.border,
            text_size: this.text_size,
            color: this.color,
            text: this.text,
            // align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
        });
    }
    getOffsetXFromIndex(index) {
        let absoluteX = 0;
        for (let i = 0; i < index; ++i) {
            absoluteX += this.textWList[i];
        }
        let res = absoluteX - this.locX;
        return res;
    }
    getIndexFromOffsetX(offsetX) {
        if (offsetX < 0 || offsetX > this.border.w) return -1;
        if (this.text.length == 0) return 0;
        let tempX = this.offsetBegin * -1;
        for (let i = this.charBegin; i < this.text.length; ++i) {
            tempX += this.textWList[i];
            if (tempX >= offsetX) return i;
        }
        return this.text.length;
    }
    setText(text) {
        this.text = text;
        this.widget.setProperty(hmUI.widget.TEXT, text);
        this.textWList = [];
        this.textLength = text.length;
        this.textTotalWidth = 0;
        for (let i = 0, width = 0; i < text.length; ++i) {
            width = hmUI.getTextLayout(text.charAt(i), {
                text_size: this.text_size,
                text_width: 0,
                wrapped: 0,
            }).width;
            this.textWList.push(width);
            this.textTotalWidth += width;
        }
        this.setLocX(this.locX); //TODO 需要优化
    }
    setLocX(locX) {
        // // 计算位于第几个字符
        // let tempX = 0
        // for (this.charBegin = 0; this.charBegin < this.textLength; ++this.charBegin) {
        //     tempX += this.textWList[this.charBegin]
        //     if (tempX >= locX) {
        //         break
        //     }
        // }
        // this.offsetBegin = this.textWList[this.charBegin] - (tempX - locX) // 实际显示的第一个文字和控件左侧的距离
        // // 获取实际显示的字符
        // this.charEnd = this.charBegin ? this.charBegin : 0
        // if(this.charEnd != this.textLength - 1 && tempX - locX < this.border.w){
        //     for (++this.charEnd; this.charEnd < this.textLength; ++this.charEnd) {
        //         tempX += this.textWList[this.charEnd]
        //         if (tempX - locX >= this.border.w) {
        //             break
        //         }
        //     }
        // }
        // this.offsetEnd = tempX - locX - this.border.w

        let maxLocX = this.textTotalWidth - this.border.w + this.leftWidth;
        if (locX > maxLocX) locX = maxLocX;
        if (locX < 0 - this.beginSafetyDistance)
            locX = 0 - this.beginSafetyDistance;
        this.locX = locX;

        // 计算开始的字符位置
        let tempX = 0;
        for (
            this.charBegin = 0;
            this.charBegin < this.textLength;
            ++this.charBegin
        ) {
            tempX += this.textWList[this.charBegin];
            if (tempX >= locX) break;
        }
        this.offsetBegin = this.textWList[this.charBegin] - (tempX - locX);
        // 计算结束的字符位置
        this.charEnd = this.charBegin;
        if (
            this.charEnd == this.textLength - 1 ||
            tempX - locX >= this.border.w
        ) {
        } else {
            for (
                ++this.charEnd;
                this.charEnd < this.textLength;
                ++this.charEnd
            ) {
                tempX += this.textWList[this.charEnd];
                if (tempX - locX >= this.border.w) break;
            }
            JSON;
        }
        this.offsetEnd = tempX - locX - this.border.w;

        this.textShow = this.text.substring(this.charBegin, this.charEnd + 1);
        // 修正至控件
        this.widget.setProperty(hmUI.widget.MORE, {
            x: this.border.x - this.offsetBegin,
            w: this.border.w + this.offsetBegin + this.offsetEnd,
            text: this.textShow,
        });
        // console.debug("setLocX:" + JSON.stringify({ textShow: this.textShow, offsetBegin: this.offsetBegin, offsetEnd: this.offsetEnd, charBegin: this.charBegin, charEnd: this.charEnd, textLength: this.textLength }))
    }
}

// link() inputbox和keyboard之间的通信事件处理
export const InputBoxLib = [
    class NORMAL {
        constructor({ text, father, title }) {
            this.father = father;
            this.text = text;
            this.backgroundWidget = null;
            this.borderWidget = null;
            this.textWidget = null;
            this.btnBorderWidget = null;
            this.btnRectWidget = null;
            this.btnTextWidget = null;
            this.titleWidget = null;
            this.charAt = 0;
            this.beginSafetyDistance = px(18);
            this.safetyDistance = px(40); // 删除和输入时光标距离边框的最大水平距离 safetyDistance
            this.border = { x: px(50), y: px(100), w: px(285), h: px(70) };
            this.btnBorder = { x: px(336), y: px(105), w: px(79), h: px(55) };
            this.title = title ? title : "请输入";
            this.cursor = new Cursor({
                border: this.border,
                line_width: px(4),
                locX: this.beginSafetyDistance,
                line_height: px(40),
                color: 0x28c4ff,
            });
            this.textLine = new TextLine({
                border: this.border,
                text: this.text,
                text_size: px(45),
                color: 0xffffff,
                beginSafetyDistance: this.beginSafetyDistance,
            });
            this.condition = InputboxCondition.NORMAL;
            this.lastTouch = { x: 0, y: 0 };
        }
        onCreate() {
            // if (dataManager.json.theme.inputbox.background.type == "img") {
            if ("img" == "img") {
                this.backgroundWidget = hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    src: "image/inputbox_bgd_Earth.png",
                });
            } else if (
                // dataManager.json.theme.inputbox.background.type == "rect"
                img == "rect"
            ) {
                this.backgroundWidget = hmUI.createWidget(
                    hmUI.widget.FILL_RECT,
                    {
                        x: px(50),
                        y: px(100),
                        w: px(285),
                        h: px(70),
                        color: dataManager.json.theme.inputbox.background.color,
                    }
                );
            }
            // this.borderWidget = hmUI.createWidget(hmUI.widget.STROKE_RECT, { x: px(50), y: px(95), w: px(376), h: px(75), line_width: px(5), color: 0xffffff, radius: px(15) })
            // this.btnRectWidget = hmUI.createWidget(hmUI.widget.FILL_RECT, { x: px(324), y: px(105), w: px(92), h: px(55), color: 0x0884D0, radius: px(6), })
            // this.btnBorderWidget = hmUI.createWidget(hmUI.widget.STROKE_RECT, { x: px(310), y: px(95), w: px(120), h: px(75), line_width: px(4), color: 0xffffff, radius: px(15) })
            this.textLine.onCreate();
            this.cursor.onCreate();
            console.debug(dataManager.json.theme.inputbox.inputBoxMask.src);
            this.mask = hmUI.createWidget(hmUI.widget.IMG, {
                x: px(0),
                y: px(0),
                src: dataManager.json.theme.inputbox.inputBoxMask.src,
            });
            this.btnTextWidget = hmUI.createWidget(hmUI.widget.TEXT, {
                x: px(335),
                y: px(105),
                w: px(80),
                h: px(55),
                text: "完成",
                text_size: px(35),
                color: dataManager.json.theme.inputbox.finishBtn.normal_color,
                align_h: hmUI.align.CENTER_H,
                align_v: hmUI.align.CENTER_V,
            });
            this.titleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
                x: px(110),
                y: px(25),
                w: px(260),
                h: px(40),
                color: 0xeeeeee,
                text_size: px(38),
                text: this.title,
                align_h: hmUI.align.CENTER_H,
                align_v: hmUI.align.CENTER_V,
            });
        }
        onTouch(event, info) {
            // console.debug("onTouch() condition(before):" + this.condition)
            switch (event) {
                case hmUI.event.CLICK_DOWN:
                    if (
                        info.x >= this.border.x &&
                        info.x <= this.border.w + this.border.x &&
                        info.y >= this.border.y &&
                        info.y <= this.border.y + this.border.h
                    ) {
                        // TextLine
                        this.condition = InputboxCondition.PRESS;
                        // this.condition &= ~InputboxCondition.MOVE
                        if (this.condition & InputboxCondition.MOVE) {
                            this.condition -= InputboxCondition.MOVE;
                        }
                        this.lastTouch = { x: info.x, y: info.y };
                    } else {
                        console.debug("click Finish");
                        new Fx({
                            begin: 0,
                            end: 1,
                            fps: 60,
                            time: 0.2,
                            enable: true,
                            style: Fx.Styles.EASE_OUT_QUAD,
                            func: (res) =>
                                this.btnTextWidget.setProperty(
                                    hmUI.prop.COLOR,
                                    Fx.getMixColor(
                                        dataManager.json.theme.inputbox
                                            .finishBtn.normal_color,
                                        dataManager.json.theme.inputbox
                                            .finishBtn.press_color,
                                        res
                                    )
                                ),
                            onStop: () => {
                                click();
                                new Fx({
                                    begin: 0,
                                    end: 1,
                                    fps: 60,
                                    time: 0.2,
                                    style: Fx.Styles.EASE_IN_QUAD,
                                    enable: true,
                                    func: (res) =>
                                        this.btnTextWidget.setProperty(
                                            hmUI.prop.COLOR,
                                            Fx.getMixColor(
                                                dataManager.json.theme.inputbox
                                                    .finishBtn.press_color,
                                                dataManager.json.theme.inputbox
                                                    .finishBtn.normal_color,
                                                res
                                            )
                                        ),
                                    onStop() {},
                                });
                            },
                        });
                        return { type: LINK_EVENT_TYPE.FINISH };
                    }
                    break;
                case hmUI.event.CLICK_UP:
                    // TextLine
                    if (
                        (this.condition & InputboxCondition.MOVE) == 0 &&
                        info.x >= this.border.x &&
                        info.x <= this.border.x + this.border.w &&
                        info.y >= this.border.y &&
                        info.y <= this.border.y + this.border.h
                    ) {
                        this.charAt = this.textLine.getIndexFromOffsetX(
                            info.x - this.border.x
                        );
                        // console.debug("charAt"+this.charAt)
                        this.cursor.move(
                            this.textLine.getOffsetXFromIndex(this.charAt),
                            true
                        );
                    }
                    break;
                case hmUI.event.MOVE_IN:
                case hmUI.event.MOVE_OUT:
                    break;
                case hmUI.event.MOVE:
                    if (this.condition & InputboxCondition.PRESS) {
                        this.condition |= InputboxCondition.MOVE;
                        this.textLine.setLocX(
                            this.textLine.locX - info.x + this.lastTouch.x
                        );
                        this.cursor.move(
                            this.textLine.getOffsetXFromIndex(this.charAt),
                            false
                        );

                        this.lastTouch.x = info.x;
                        this.lastTouch.y = info.y;
                    }
                    break;
            }
            // console.debug("onTouch() condition(end):" + this.condition)
            // console.debug("this.condition & InputboxCondition.MOVE="+(this.condition & InputboxCondition.MOVE))
        }
        link(res) {
            // console.debug("inputBox.link: package" + JSON.stringify(res))
            switch (res.event) {
                case LINK_EVENT_TYPE.INPUT: // 输入
                    this.text =
                        this.text.substring(0, this.charAt) +
                        res.data +
                        this.text.substring(this.charAt, this.text.length);
                    ++this.charAt;
                    break;
                case LINK_EVENT_TYPE.DELETE: // 删除
                    if (this.text.length) {
                        this.text =
                            this.text.substring(0, this.charAt - 1) +
                            this.text.substring(this.charAt, this.text.length);
                        --this.charAt;
                    } else {
                        console.debug("inputBox: text is empty");
                    }
                    break;
                case LINK_EVENT_TYPE.CHANGE: // 改变
                    if (this.text.length) {
                        this.text =
                            this.text.substring(0, this.charAt - 1) +
                            res.data +
                            this.text.substring(this.charAt, this.text.length);
                    } else {
                        console.debug("inputBox: text is empty");
                    }
            }
            this.textLine.setText(this.text);
            let offset = this.textLine.getOffsetXFromIndex(this.charAt);
            if (
                offset < this.safetyDistance &&
                this.textLine.textTotalWidth > this.safetyDistance
            ) {
                this.textLine.setLocX(
                    this.textLine.locX + offset - this.safetyDistance
                );
                offset = this.safetyDistance;
            } else if (offset > this.border.w - this.safetyDistance) {
                this.textLine.setLocX(
                    this.textLine.locX +
                        offset -
                        this.border.w +
                        this.safetyDistance
                );
                offset = this.border.w - this.safetyDistance;
            }
            this.cursor.move(offset, true);

            // this.textWidget.setProperty(hmUI.prop.TEXT, this.text)
        }
        onDelete() {}
    },
];
