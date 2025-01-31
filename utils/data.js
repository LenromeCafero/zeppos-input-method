import { json2str, str2json } from "../shared/data";
import { readFileSync, writeFileSync } from "../shared/fs";
export const file = "data.bin";
const logger = DeviceRuntimeCore.HmLogger.getLogger("untils_data.js");

export const jsonExample = {
  keyboardList: [0, 1, 2],
  from: {
    appid: 0,
    url: "",
    param: "{}", //传参，提供给调用源作为补充，会一模一样返回去
  },
  theme: {
    //dark
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
  longPressMs: 300,
  longPressMsAfterMove: 600,
  safetyDistance: px(40),
  delTimeMs: 180,
};

export function getTargetList(listName) {
  data.json.lists.forEach((object) => {
    if (object.name == listName) {
      return object;
    } else {
      return null;
    }
  });
}

export class Data {
  constructor() {
    this.json = null;
    let str = readFileSync(file, {});
    if (str == undefined) {
      writeFileSync(file, json2str(jsonExample), {});
      this.json = str2json(readFileSync(file, {}));
    } else {
      this.json = str2json(str);
    }
  }
  save(option) {
    writeFileSync(file, json2str(this.json), {});
  }
  reload(option) {
    let str = readFileSync(file, {});
    if (str == undefined) {
      // create
      writeFileSync(file, json2str(jsonExample), {});
      this.json = str2json(readFileSync(file, {}));
    } else {
      this.json = str2json(str);
    }
  }
  reset() {
    this.json = jsonExample;
    this.save();
  }
}

export const data = new Data();
