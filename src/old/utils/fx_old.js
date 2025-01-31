// CuberQAQ
// 用来提供简易动画的库
//
// Fx 动画类
// 提供了使用预设和不使用预设两种方式
// 提供的预设(Fx.Styles的成员变量)有：
//   LINEAR 线性
//   EASE_IN_QUAD 二次平滑减速
//   EASE_OUT_QUAD 二次平滑加速
//   EASE_IN_OUT_QUAD 二次平滑加速后减速
// 示例代码(使用预设):
// let fx = new Fx({
//   begin: 100, // 初始函数值
//   end: 200,   // 结束函数值
//   fps: 60,    // 帧率
//   time: 1,    // 总时长(秒)
//   style: Fx.Styles.EASE_IN_OUT_QUAD, // 预设类型 见注释第7-9行
//   onStop() {console.log("anim stop")}, // 动画结束后的回调函数
// 
//   // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
//   func: result => text.setProperty(hmUI.prop.X, result) 
// })
// fx.restart() // 播放动画 可以重复多次调用
//
// 不使用预设太麻烦了 不如不用
//
// 还提供了一个专为颜色渐变设计的函数getMixColor，可以获取两个颜色的中间色
// 参数:
//   color0: 初始颜色(6位16进制数)
//   color1: 初始颜色(6位16进制数)
//   percentage: 混合百分比(范围[0,1]，越小越接近color0)


export class Fx {
  // constructor 构造函数
  // 参数:
  //   -----不使用预设-----
  //   x_start 函数开始的x坐标
  //   x_end 函数结束的x坐标
  //   fps 动画帧率
  //   time 执行总时间
  //   fx: x => y 动画函数
  //   func(y) 执行的函数，每次的y值会作为第一个参数传给func
  //   onStop() 结束后执行的函数
  //   -----使用预设-----
  //   begin 初始值
  //   end 结束值
  //   fps 动画帧率
  //   time 执行总时间
  //   style 内置过渡类型
  //   func(y) 执行的函数，每次的y值会作为第一个参数传给func
  //   onStop 结束后执行的函数
  constructor({ delay, begin, end, x_start, x_end, time, fx, func, fps, enable, style, onStop, option }) {
    if (fx) { // 不使用预设
      this.x_start = x_start * 1.0
      this.x_end = x_end * 1.0
      this.fx = fx
      this.speed = (x_end - x_start) / (time * fps)
    }
    else { // 使用预设
      this.begin = begin
      this.end = end
      this.fps = fps
      this.time = time
      switch (style) {
        case Fx.Styles.LINEAR:
          this.fx = x => fx_inside.LINEAR(x, begin, end, fps * time)
          this.x_start = 0
          this.x_end = fps * time
          this.speed = 1
          break;
        case Fx.Styles.EASE_IN_OUT_QUAD:
          this.fx = x => fx_inside.EASE_IN_OUT_QUAD(x, begin, end, fps * time)
          this.x_start = 0
          this.x_end = fps * time
          this.speed = 1
          break;
        case Fx.Styles.EASE_IN_QUAD:
          this.fx = x => fx_inside.EASE_IN_QUAD(x, begin, end, this.fps * this.time)
          this.x_start = 0
          this.x_end = fps * time
          this.speed = 1
          break;
        case Fx.Styles.EASE_OUT_QUAD:
          this.fx = x => fx_inside.EASE_OUT_QUAD(x, begin, end, fps * time)
          this.x_start = 0
          this.x_end = fps * time
          this.speed = 1
          break;
      }
    }
    this.per_clock = 1000 / fps
    this.delay = delay
    this.func = func
    this.x_now = this.x_start
    this.option = option
    this.onStop = onStop
    if (enable == undefined) {
      this.enable = true
    }
    else {
      this.enable = enable
    }
    this.timer = null

    this.setEnable(this.enable)
  }
  restart() {
    this.x_now = this.x_start
    this.setEnable(false)
    this.setEnable(true)
  }
  setEnable(enable) {
    if (enable) {
      this.registerTimer()
    }
    else {
      if (this.timer) {
        timer.stopTimer(this.timer)
        this.timer = null
      }
    }
  }
  registerTimer() {
    this.timer = timer.createTimer(
      this.delay ? this.delay : 0,
      this.per_clock,
      (option) => {

        this.func(this.fx(this.x_now += this.speed), this.option)
        if (this.x_now > this.x_end) {
          //防止不到终点
          this.func(this.fx(this.x_end), this.option)
          //执行onStop
          if (this.onStop != undefined) { this.onStop(this.option) }
          //停止timer
          timer.stopTimer(this.timer)
          this.timer = null
          this.enable = false
        }
      },
      {}
    )
  }
  static getMixColor(color0, color1, percentage) {
    let r0 = color0 & 0xFF0000, g0 = color0 & 0x00FF00, b0 = color0 & 0x0000FF
    let r1 = color1 & 0xFF0000, g1 = color1 & 0x00FF00, b1 = color1 & 0x0000FF
    return (Math.floor((r1 - r0) * percentage + r0) & 0xFF0000)
      + (Math.floor((g1 - g0) * percentage + g0) & 0x00FF00)
      + (Math.floor((b1 - b0) * percentage + b0) & 0x0000FF)
  }
  static getMixBorder(border1, border2, percentage) {
    return {
      x: border1.x + (border2.x - border1.x) * percentage,
      y: border1.y + (border2.y - border1.y) * percentage,
      w: border1.w + (border2.w - border1.w) * percentage,
      h: border1.h + (border2.h - border1.h) * percentage,
    }
  }
}
Fx.Styles = {
  LINEAR: 0,
  EASE_IN_OUT_QUAD: 1,
  EASE_IN_QUAD: 2,
  EASE_OUT_QUAD: 3
}
const fx_inside = {
  // 线性
  LINEAR: function (now_x, begin, end, max_x) {
    return (end - begin) / max_x * now_x + begin
  },
  // 二次平滑 进入与出去
  EASE_IN_OUT_QUAD: function (now_x, begin, end, max_x) {
    let length = end - begin
    if ((now_x /= max_x / 2) < 1) { // 未过半
      return length / 2 * now_x * now_x + begin // 
    }
    else { // 过半
      return -length / 2 * ((--now_x) * (now_x - 2) - 1) + begin
    }
  },
  // 二次平滑 进入
  EASE_IN_QUAD: function (now_x, begin, end, max_x) {
    return (begin - end) / (max_x * max_x) * (max_x - now_x) * (max_x - now_x) + end
  },
  // 二次平滑 出去
  EASE_OUT_QUAD: function (now_x, begin, end, max_x) {
    return (end - begin) / (max_x * max_x) * now_x * now_x + begin
  },
}
