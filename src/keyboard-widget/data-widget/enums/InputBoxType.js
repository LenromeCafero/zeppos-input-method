/**
 * 输入框类型枚举
 */
export const InputBoxType = {
    NORMAL: "normal",
    PASSWORD: "password", 
    SEARCH: "search",
    MULTILINE: "multiline"
};

export const InputBoxTypeUtil = {
    supportsCursor(type) {
        return type !== InputBoxType.PASSWORD;
    },
    
    getDefaultMaxLength(type) {
        const defaults = {
            [InputBoxType.NORMAL]: 100,
            [InputBoxType.PASSWORD]: 20,
            [InputBoxType.SEARCH]: 50,
            [InputBoxType.MULTILINE]: 500
        };
        return defaults[type];
    }
};