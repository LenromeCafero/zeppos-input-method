/**
 * 输入框状态条件枚举
 */
export const InputboxCondition = {
    NORMAL: 0,        // 正常状态
    PRESS: 1,         // 按下状态
    MOVE: 2,          // 移动状态
    FOCUS: 4,         // 获得焦点
    BLUR: 8           // 失去焦点
};

export const InputboxConditionUtil = {
    // 类似键盘状态的工具方法
    hasCondition(state, condition) {
        return (state & condition) === condition;
    },
    
    // 特定状态检查
    isInteractive(state) {
        return this.hasCondition(state, InputboxCondition.PRESS) || 
               this.hasCondition(state, InputboxCondition.MOVE);
    },
    
    isFocused(state) {
        return this.hasCondition(state, InputboxCondition.FOCUS);
    }
};