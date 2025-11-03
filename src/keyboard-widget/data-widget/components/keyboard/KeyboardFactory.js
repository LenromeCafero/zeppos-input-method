import { KeyboardType } from '../../enums/KeyboardType.js';
import { EnglishKeyboard } from './EnglishKeyboard.js';
import { ChinesePinyinKeyboard } from './ChineseKeyboard.js';
import { NumberKeyboard } from './NumberKeyboard.js';

export class KeyboardFactory {
    static createKeyboard(type, config) {
        const keyboardMap = {
            [KeyboardType.ENGLISH]: EnglishKeyboard,
            [KeyboardType.CHINESE_PINYIN]: ChinesePinyinKeyboard,
            [KeyboardType.NUMBER]: NumberKeyboard,
            // [KeyboardType.SYMBOL]: SymbolKeyboard
        };

        const KeyboardClass = keyboardMap[type];
        if (!KeyboardClass) {
            console.warn(`Unknown keyboard type: ${type}, using English as fallback`);
            return new EnglishKeyboard(config);
        }

        return new KeyboardClass(config);
    }

    static getAvailableTypes() {
        return Object.keys(this.keyboardMap);
    }
}