// 获取设备信息
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device'
const { width, screenShape } = getDeviceInfo()

// 全局常量
export const BOUNDARY_Y = SCREEN_SHAPE_SQUARE ? px(190) : px(190); // InputBox和Keyboard分界线y坐标
export const FUNCTION_BAR_H = SCREEN_SHAPE_SQUARE ? px(50) : px(50); // 预留给选词和工具区域的高度

// 键盘类型
export const KEYBOARD_TYPE = {
    EN: 0, // 英文键盘
    NUM: 1, // 数字键盘
    ZH_CN_PY: 2, // 中文拼音键盘
};

// 输入框类型
export const INPUTBOX_TYPE = {
    NORMAL: 0, // 普通输入框
    PASSWORD: 1, // 密码输入框
};

// 事件类型
export const LINK_EVENT_TYPE = {
    FINISH: 1, // 输入完成
    INPUT: 2, // 输入事件
    DELETE: 3, // 删除事件
    CHANGE: 4, // 内容变化事件
};

// 键盘状态
export const KeyBoardCondition = {
    FREE: 0, // 空闲状态
    WAIT_WORD: 1, // 等候选词
    PRESS: 2, // 按下状态
};

export const InputboxCondition = {
    NORMAL: 0,
    PRESS: 1,
    MOVE: 2,
};


// 示例JSON配置
export const jsonExample = {
    keyboardList: [0, 1, 2], // 键盘列表
    from: {
        appid: 0, // 应用ID
        url: "", // URL
        param: "{}", // 传参，提供给调用源作为补充，会一模一样返回去
    },
    theme: {
        // 主题配置
        inputbox: {
            finishBtn: {
                normal_color: 0xfff1a6, // 完成按钮正常颜色
                press_color: 0x666142, // 完成按钮按下颜色
            },
            inputBoxMask: {
                src: "image/inputbox_mask_Earth.png", // 输入框遮罩图片
            },
            background: {
                color: 0x333333, // 背景颜色
                type: "img", // 类型：图片
                src: "image/inputbox_bgd_Earth.png", // 背景图片
            },
        },
        keyboard: {
            functionBar: {
                color: 0x494949, // 功能栏颜色
                type: "img", // 类型：图片
                src: "image/functionBar_Earth.png", // 功能栏图片
            },
            background: {
                color: 0x222222, // 键盘背景颜色
                type: "img", // 类型：图片
                src: "image/keyboard_bgd_Earth.png", // 键盘背景图片
            },
            button: {
                color: 0x555555, // 按钮颜色
                radius: 6, // 按钮圆角
                distance_v: 6, // 行之间距离
                distance_h: 6, // 列之间距离
                press_color: 0xee6666, // 按钮按下颜色
                src: "image/keyboardEN_button_Earth.png", // 按钮图片
                src_up: "image/keyboardEN_button_Earth_UP.png", // 按钮抬起图片
            },
        },
    },
    longPressMs: 300, // 长按触发时间（毫秒）
    longPressMsAfterMove: 600, // 移动后长按触发时间（毫秒）
    safetyDistance: px(40), // 安全距离
    delTimeMs: 180, // 删除按键触发时间（毫秒）
};
export const QWERT_Layout = {
    // QWERT键盘
    NumberAndSymbol: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "0",
        "!",
        "@",
        "#",
        "-",
        "%",
        "&",
        "*",
        "(",
        ")",
        "~",
        "/",
        ".",
        ",",
        ":",
        ";",
        "?",
    ],
    Letters: {
        Capital: [
            "Q",
            "W",
            "E",
            "R",
            "T",
            "Y",
            "U",
            "I",
            "O",
            "P",
            "A",
            "S",
            "D",
            "F",
            "G",
            "H",
            "J",
            "K",
            "L",
            "Z",
            "X",
            "C",
            "V",
            "B",
            "N",
            "M",
        ],
        LowerCase: [
            "q",
            "w",
            "e",
            "r",
            "t",
            "y",
            "u",
            "i",
            "o",
            "p",
            "a",
            "s",
            "d",
            "f",
            "g",
            "h",
            "j",
            "k",
            "l",
            "z",
            "x",
            "c",
            "v",
            "b",
            "n",
            "m",
        ],
    },
};
