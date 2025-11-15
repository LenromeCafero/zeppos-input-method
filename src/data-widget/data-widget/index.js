import { InputMethod } from "../utils/inputMethod/inputMethod";
const inputMethod = new InputMethod({
  keyboard_type: InputMethod.KEYBOARD_TYPE.ENGLISH,
  inputbox_type: InputMethod.INPUTBOX_TYPE.NORMAL,
  text: "",
  title: "输入法",
});

DataWidget({
  state: {
    text: "Hello Zepp OS",
  },

  onInit() {
    console.log("onInit");
  },
  build() {
    console.log("build");
    console.log(this.state.text);
    inputMethod.start();
  },
});
