import { InputMethod } from './core/InputMethod.js';
import { ConfigBuilder } from './core/ConfigManager.js';
import { KeyboardType } from './enums/KeyboardType.js';
import { InputBoxType } from './enums/InputBoxType.js';
import { DefaultTheme } from './data/themes/DefaultTheme.js';

// 全局输入法实例
let inputMethod = null;

/**
 * 启动输入法
 * @param {Object} options 配置选项
 */
export function startInputMethod(options = {}) {
    // 构建配置
    const config = new ConfigBuilder()
        .setTheme(DefaultTheme)
        .setKeyboardType(options.keyboardType || KeyboardType.ENGLISH)
        .setInputBoxType(options.inputBoxType || InputBoxType.NORMAL)
        .setMaxLength(options.maxLength || 100)
        .setTitle(options.title || "请输入")
        .build();

    // 创建输入法实例
    inputMethod = new InputMethod(config);
    
    // 启动输入法
    inputMethod.start();
    
    return inputMethod;
}

/**
 * 获取当前输入法实例
 */
export function getInputMethod() {
    return inputMethod;
}

/**
 * 销毁输入法
 */
export function destroyInputMethod() {
    if (inputMethod) {
        inputMethod.destroy();
        inputMethod = null;
    }
}

/**
 * 快速启动英文输入法
 */
export function startEnglishInput(options = {}) {
    return startInputMethod({
        ...options,
        keyboardType: KeyboardType.ENGLISH
    });
}

/**
 * 快速启动中文拼音输入法
 */
export function startChineseInput(options = {}) {
    return startInputMethod({
        ...options,
        keyboardType: KeyboardType.CHINESE_PINYIN
    });
}

/**
 * 快速启动数字输入法
 */
export function startNumberInput(options = {}) {
    return startInputMethod({
        ...options,
        keyboardType: KeyboardType.NUMBER
    });
}