import { InputMethod } from '../utils/inputMethod/inputMethod'

Page({
  build() {
    console.log("Data Widget Input Method Page build")
    const inputMethod = new InputMethod({
      keyboard_list: [0],
      inputbox_type: [0],
      max_byte: 50,
      text: "",
      title: "输入法"
    })
    // inputMethod.start()
  },
  onInit() {
  },

  onDestroy() {
    // 取消注册手势监听
    // inputMethod.delete()
  },
})