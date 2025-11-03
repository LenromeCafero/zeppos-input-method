/**
 * 键盘类型枚举
 */
export const KeyboardType = {
    ENGLISH: "en",
    CHINESE_PINYIN: "zh_cn_py",
    NUMBER: "num", 
    SYMBOL: "symbol"
};

// 辅助方法
export const KeyboardTypeUtil = {
    isValid(type) {
        return Object.values(KeyboardType).includes(type);
    },
    
    getDisplayName(type) {
        const names = {
            [KeyboardType.ENGLISH]: "英文键盘",
            [KeyboardType.CHINESE_PINYIN]: "拼音键盘",
            [KeyboardType.NUMBER]: "数字键盘",
            [KeyboardType.SYMBOL]: "符号键盘"
        };
        return names[type] || "未知键盘";
    },
    
    getDefault() {
        return KeyboardType.ENGLISH;
    }
};