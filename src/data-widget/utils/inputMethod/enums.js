// 键盘类型
export const KEYBOARD_TYPE = {
    ENGLISH: "EN",
    CHINESE_PINYIN: "ZH_CN_PY",
    NUMBER: "NUM",
    SYMBOL: "SYMBOL",
};

// 输入框类型
export const INPUTBOX_TYPE = {
  NORMAL: "NORMAL", // 普通输入框
  PASSWORD: "PASSWORD", // 密码输入框
};

// 事件类型
export const LINK_EVENT_TYPE = {
  FINISH: "FINISH", // 输入完成
  INPUT: "INPUT", // 输入事件
  DELETE: "DELETE", // 删除事件
  CHANGE: "CHANGE", // 内容变化事件
};

// 键盘状态
export const KeyBoardCondition = {
  FREE: "FREE", // 空闲状态
  WAIT_WORD: "WAIT_WORD", // 等候选词
  PRESS: "PRESS", // 按下状态
};

export const InputboxCondition = {
  NORMAL: "NORMAL", // 普通状态
  PRESS: "PRESS", // 按下状态
  MOVE: "MOVE", // 移动状态
};
