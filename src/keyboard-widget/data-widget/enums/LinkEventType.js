/**
 * 组件间通信事件类型枚举
 */
export const LinkEventType = {
    // 输入操作
    INPUT: "input",
    DELETE: "delete",
    CHANGE: "change",
    
    // 控制命令
    FINISH: "finish",
    CANCEL: "cancel",
    CLEAR: "clear",
    
    // 光标控制
    CURSOR_LEFT: "cursor_left",
    CURSOR_RIGHT: "cursor_right",
    CURSOR_HOME: "cursor_home",
    CURSOR_END: "cursor_end",
    
    // 系统命令
    SWITCH_KEYBOARD: "switch_keyboard",
    SHOW_CANDIDATES: "show_candidates",
    HIDE_CANDIDATES: "hide_candidates"
};

// 事件分类
export const LinkEventCategory = {
    INPUT: [
        LinkEventType.INPUT,
        LinkEventType.DELETE,
        LinkEventType.CHANGE
    ],
    NAVIGATION: [
        LinkEventType.CURSOR_LEFT,
        LinkEventType.CURSOR_RIGHT,
        LinkEventType.CURSOR_HOME,
        LinkEventType.CURSOR_END
    ],
    CONTROL: [
        LinkEventType.FINISH,
        LinkEventType.CANCEL,
        LinkEventType.CLEAR
    ]
};