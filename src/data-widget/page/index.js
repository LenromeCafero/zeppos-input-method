import * as zosGesture from "@zos/interaction";
import { getTextLayout } from "@zos/ui";

import { InputMethod } from "../utils/inputMethod/inputMethod";

const inputMethod = new InputMethod({
  keyboard_type: "EN",
  inputbox_type: "NORMAL",
  text: "",
  title: "输入法",
});

Page({
  build() {
    console.log("Data Widget Input Method Page build");

    // function debugSpaceWidthsRecursive(maxLength, currentLength = 1) {
    //   if (currentLength > maxLength) {
    //     return;
    //   }

    //   const spaceChar = " ".repeat(currentLength);
    //   const { width, height } = getTextLayout(spaceChar, {
    //     text_size: px(30),
    //     text_width: 0,
    //     wrapped: 0,
    //   });

    //   console.log(
    //     `空格长度: ${currentLength
    //       .toString()
    //       .padStart(3)}, 字符: "${spaceChar}", 宽度: ${width}`,
    //   );

    //   debugSpaceWidthsRecursive(maxLength, currentLength + 1);
    // }

    // debugSpaceWidthsRecursive(20);
    inputMethod.start();

    zosGesture.onGesture({
      callback: (event) => {
        return true;
      },
    });
  },
  onInit() {},

  onDestroy() {
    // 取消注册手势监听
    inputMethod.delete();
  },
});
