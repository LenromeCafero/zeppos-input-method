/**
 * 键盘状态条件枚举 - 使用位标志
 */
export const KeyBoardCondition = {
    FREE: 0,          // 0000 - 空闲状态
    PRESS: 1,         // 0001 - 按键按下
    MOVE: 2,          // 0010 - 移动状态  
    WAIT_WORD: 4,     // 0100 - 等待选词
    LONG_PRESS: 8     // 1000 - 长按状态
};

// 状态操作工具
export const KeyBoardConditionUtil = {
    hasCondition(state, condition) {
        return (state & condition) === condition;
    },
    
    addCondition(state, condition) {
        return state | condition;
    },
    
    removeCondition(state, condition) {
        return state & ~condition;
    },
    
    toggleCondition(state, condition) {
        return state ^ condition;
    },
    
    // 状态验证
    isValidState(state) {
        const allConditions = Object.values(KeyBoardCondition)
            .reduce((sum, cond) => sum | cond, 0);
        return (state & ~allConditions) === 0;
    }
};