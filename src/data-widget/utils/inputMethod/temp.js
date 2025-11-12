// 一些不知道的东西，临时存储一下
/**
 * data2是什么呢？
 * 主题样式吗？
 * 来自inputMethod.js
 */
export const data2 = {
  //TODO
  json: {
    keyboardList: [0, 1, 2],
    from: {
      appid: 0,
      url: "",
      param: "{}", //传参，提供给调用源作为补充，会一模一样返回去
    },
    theme: {
      inputbox: {
        finishBtn: {
          normal_color: 0xfff1a6,
          press_color: 0x666142,
        },
        inputBoxMask: {
          src: "image/inputbox_mask_Earth.png",
        },
        background: {
          color: 0x333333,
          type: "img",
          src: "image/inputbox_bgd_Earth.png",
        },
      },
      keyboard: {
        functionBar: {
          color: 0x494949,
          type: "img",
          src: "image/functionBar_Earth.png",
        },
        background: {
          color: 0x222222,
          type: "img",
          src: "image/keyboard_bgd_Earth.png",
        },
        button: {
          color: 0x555555,
          radius: 6,
          distance_v: 6, // 行之间距离
          distance_h: 6, //列之间距离
          press_color: 0xee6666,
          src: "image/keyboardEN_button_Earth.png",
          src_up: "image/keyboardEN_button_Earth_UP.png",
        },
      },
    },

    // "theme": { //dark
    //   "inputbox": {
    //     "finishBtn": {
    //       "normal_color": 0xfff1a6,
    //       "press_color": 0x666142
    //     },
    //     "inputBoxMask": {
    //       "src": "image/inputboxBgd2.png"
    //     },
    //     "background": {
    //       "color": 0x333333,
    //       "type": "rect"
    //     },
    //   },
    //   "keyboard": {
    //     "functionBar": {
    //       "color": 0x494949,
    //       "type": "rect",
    //       "src": "image/functionBar.png"
    //     },
    //     "background": {
    //       "color": 0x222222,
    //       "type": "rect",
    //       //"src": "image/earth2_glass.png"
    //     },
    //     "button": {
    //       "color": 0x555555,
    //       "radius": 6,
    //       "distance_v": 6, // 行之间距离
    //       "distance_h": 6,//列之间距离
    //       "press_color": 0xee6666,
    //       "src": "image/keyboardEN_button_Dark.png"
    //     },
    //   },

    // },
    longPressMs: 300,
    longPressMsAfterMove: 600,
    safetyDistance: px(40),
    delTimeMs: 180,
  },
};

/**
 * themeList
 * 来自inputMethod.js
 */
export const themeList = [
  {
    //dark
    inputbox: {
      finishBtn: {
        normal_color: 0xfff1a6,
        press_color: 0x666142,
      },
      inputBoxMask: {
        src: "image/inputboxBgd2.png",
      },
      background: {
        color: 0x333333,
        type: "rect",
      },
    },
    keyboard: {
      functionBar: {
        color: 0x494949,
        type: "rect",
      },
      background: {
        color: 0x222222,
        type: "rect",
      },
      button: {
        color: 0x555555,
        radius: 6,
        distance_v: 6, // 行之间距离
        distance_h: 6, //列之间距离
        press_color: 0xee6666,
      },
    },
  },
];
