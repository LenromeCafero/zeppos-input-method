import { BaseKeyboard } from './BaseKeyboard.js';
import { pinyin_dict_notone } from '../../data/dictionaries/pinyin_dict_notone.js';

export class ChinesePinyinKeyboard extends BaseKeyboard {
    constructor(config) {
        super(config);
        this.currentPinyin = "";
    }

    chooseWord(input) {
        if (input === "DELETE") {
            this.currentPinyin = this.currentPinyin.slice(0, -1);
        } else {
            this.currentPinyin += input;
        }

        const candidates = this.getPinyinCandidates(this.currentPinyin);
        this.updateChooseWordDisplay(candidates);
    }

    getPinyinCandidates(pinyin) {
        if (!pinyin) return [];
        
        const sortedKeys = Object.keys(pinyin_dict_notone).sort(
            (a, b) => b.length - a.length
        );

        for (const key of sortedKeys) {
            if (pinyin.startsWith(key)) {
                return Array.from(pinyin_dict_notone[key]).slice(0, 5);
            }
        }
        return [];
    }

    handleFunctionBarTouch(event, info) {
        if (event === hmUI.event.CLICK_UP) {
            const selectedWord = this.getSelectedWord(info);
            if (selectedWord) {
                this.currentPinyin = "";
                this.updateChooseWordDisplay([]);
                return {
                    type: LinkEventType.INPUT,
                    data: selectedWord
                };
            }
        }
        return null;
    }

    getSelectedWord(info) {
        const words = this.getPinyinCandidates(this.currentPinyin);
        const spaceWidth = hmUI.getTextLayout("  ", {
            text_size: px(30), text_width: 0, wrapped: 0
        }).width;

        let currentX = this.chooseWordText.border.x;
        for (const word of words) {
            const wordWidth = hmUI.getTextLayout(word, {
                text_size: px(30), text_width: 0, wrapped: 0
            }).width;

            if (info.x >= currentX && info.x < currentX + wordWidth) {
                return word;
            }
            currentX += wordWidth + spaceWidth;
        }
        return null;
    }
}