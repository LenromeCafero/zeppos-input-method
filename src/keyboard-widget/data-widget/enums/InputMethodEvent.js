/**
 * 输入法内部事件类型枚举
 */
export const InputMethodEvent = {
    // 文本相关
    TEXT_CHANGE: "text_change",
    TEXT_COMMIT: "text_commit",
    CURSOR_MOVE: "cursor_move",
    
    // 候选词相关
    CANDIDATE_UPDATE: "candidate_update",
    CANDIDATE_SELECT: "candidate_select",
    
    // 键盘相关
    KEYBOARD_SWITCH: "keyboard_switch",
    KEYBOARD_LAYOUT_CHANGE: "keyboard_layout_change",
    
    // 系统事件
    INPUT_START: "input_start",
    INPUT_COMPLETE: "input_complete",
    INPUT_CANCEL: "input_cancel",
    
    // 配置事件
    THEME_CHANGE: "theme_change",
    CONFIG_UPDATE: "config_update"
};

// 事件分类
export const EventCategory = {
    TEXT: [
        InputMethodEvent.TEXT_CHANGE,
        InputMethodEvent.TEXT_COMMIT,
        InputMethodEvent.CURSOR_MOVE
    ],
    CANDIDATE: [
        InputMethodEvent.CANDIDATE_UPDATE,
        InputMethodEvent.CANDIDATE_SELECT
    ],
    SYSTEM: [
        InputMethodEvent.INPUT_START,
        InputMethodEvent.INPUT_COMPLETE,
        InputMethodEvent.INPUT_CANCEL
    ]
};