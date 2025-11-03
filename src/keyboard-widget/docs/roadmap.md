以下是各个部分的功能规划Roadmap和函数定义：

## 1. 核心框架 (core/) Roadmap

### InputMethod.js (主控制器)
```javascript
/**
 * 输入法主控制器 - 协调所有组件工作
 */
class InputMethod {
    constructor(config) // 初始化配置和组件
    setupComponents() // 创建输入框、键盘、输入引擎
    setupEventHandlers() // 设置事件监听
    setupControlPlane() // 创建触控分发层
    handleTouch(event, info) // 统一触控事件分发
    handleTextChange(data) // 处理文本变化
    switchKeyboard(type) // 动态切换键盘类型
    start() // 启动输入法
    finish() // 完成输入并清理
    getText() / setText() // 文本访问器
    destroy() // 清理资源
}
```

### EventBus.js
```javascript
class EventBus {
    on(event, callback) // 订阅事件
    emit(event, data) // 发布事件
    off(event, callback) // 取消订阅
    removeAll(event) // 移除所有监听
}
```

### ConfigManager.js
```javascript
class InputMethodConfig // 配置数据容器
class ConfigBuilder // 建造者模式配置构造器
```

## 2. UI基础组件 (components/ui/) Roadmap

### UIComponent.js
```javascript
class UIComponent {
    createWidget(config) // 创建并管理UI组件
    destroy() // 统一清理UI资源
    onDestroy() // 子类重写的清理钩子
}
```

### Cursor.js
```javascript
class Cursor extends UIComponent {
    constructor(config) // 初始化光标属性
    onCreate() // 创建光标UI
    setFlash(enable) // 控制闪烁效果
    move(locX, useFx) // 移动光标（支持动画）
}
```

### TextLine.js
```javascript
class TextLine extends UIComponent {
    constructor(config) // 初始化文本属性
    onCreate() // 创建文本UI
    calculateTextMetrics() // 计算文本尺寸
    getOffsetXFromIndex(index) // 字符索引转像素坐标
    getIndexFromOffsetX(offsetX) // 像素坐标转字符索引
    setText(text) // 更新文本内容
    setLocX(locX) // 设置滚动位置
}
```

## 3. 输入框系统 (components/inputbox/) Roadmap

### BaseInputBox.js
```javascript
class BaseInputBox extends UIComponent {
    constructor(config) // 基础输入框配置
    onCreate() // 创建输入框UI
    onTouch(event, info) // 处理触控事件
    link(data) // 处理键盘通信
    manageCursor() // 光标管理（抽象）
    renderText() // 文本渲染（抽象）
    getText() / setText() // 文本访问
}
```

### 具体输入框实现
```javascript
class NormalInputBox extends BaseInputBox // 普通输入框
class PasswordInputBox extends BaseInputBox // 密码输入框（显示*号）
class SearchInputBox extends BaseInputBox // 搜索输入框（带搜索图标）
```

### InputBoxFactory.js
```javascript
class InputBoxFactory {
    static createInputBox(type, config) // 工厂方法创建输入框
}
```

## 4. 键盘系统 (components/keyboard/) Roadmap

### BaseKeyboard.js
```javascript
class BaseKeyboard extends UIComponent {
    constructor(config) // 基础键盘配置
    onCreate() // 创建键盘UI
    onTouch(event, info) // 触控事件处理（模板方法）
    preTouch() / postTouch() // 触控前后处理
    handleTouch(event, info) // 具体触控处理（抽象）
    getKeyLayout() // 获取键盘布局（抽象）
    getKeyIndex(info) // 坐标转按键索引
    getKeyBorder(index) // 获取按键边界
    longPress() // 长按处理
    chooseWord(input) // 候选词处理
    link(event) // 输入框通信
}
```

### 具体键盘实现
```javascript
class EnglishKeyboard extends BaseKeyboard // 英文键盘
class NumberKeyboard extends BaseKeyboard // 数字键盘  
class ChinesePinyinKeyboard extends BaseKeyboard // 中文拼音键盘
class SymbolKeyboard extends BaseKeyboard // 符号键盘
```

### KeyboardFactory.js
```javascript
class KeyboardFactory {
    static createKeyboard(type, config) // 工厂方法创建键盘
}
```

## 5. 输入法引擎 (components/keyboard/engines/) Roadmap

### IInputEngine.js (接口)
```javascript
class IInputEngine {
    processInput(input, context) // 处理输入，返回结果
    getCandidates(input) // 获取候选词
    reset() // 重置引擎状态
}
```

### 具体引擎实现
```javascript
class EnglishInputEngine extends IInputEngine // 英文引擎（直接输入）
class PinyinInputEngine extends IInputEngine // 拼音引擎（智能联想）
class NumberInputEngine extends IInputEngine // 数字引擎
class SymbolInputEngine extends IInputEngine // 符号引擎
```

### InputEngineFactory.js
```javascript
class InputEngineFactory {
    static createEngine(keyboardType) // 工厂方法创建引擎
}
```

## 6. 键盘布局 (components/keyboard/layouts/) Roadmap

```javascript
class QwertyLayout // QWERTY布局定义
class NumberLayout // 数字布局定义  
class SymbolLayout // 符号布局定义
class ChineseLayout // 中文布局定义
```

## 7. 事件处理器 (components/keyboard/handlers/) Roadmap

```javascript
class TouchHandler // 触控事件处理逻辑
class LongPressHandler // 长按事件处理
class CandidateHandler // 候选词处理逻辑
```

## 8. 工具类 (utils/) Roadmap

### Animation.js
```javascript
class Animation {
    static fadeIn(widget, duration) // 淡入动画
    static fadeOut(widget, duration) // 淡出动画
    static slide(widget, from, to, duration) // 滑动动画
}
```

### Fx.js
```javascript
class Fx {
    constructor(config) // 动画配置
    setEnable(enable) // 启用/禁用动画
    static getMixColor(color1, color2, ratio) // 颜色混合
}
```

### TextMeasurer.js
```javascript
class TextMeasurer {
    static getTextWidth(text, fontSize) // 测量文本宽度
    static fitText(text, maxWidth, fontSize) // 文本适配
}
```

### TimerManager.js
```javascript
class TimerManager {
    createTimer(delay, interval, callback) // 创建定时器
    stopTimer(timer) // 停止定时器
    clearAll() // 清理所有定时器
}
```

### Vibration.js
```javascript
class Vibration {
    static click() // 点击反馈
    static longPress() // 长按反馈
}
```

## 9. 数据资源 (data/) Roadmap

### 字典数据
```javascript
// pinyin_dict_notone.js - 拼音字典
// english_dict.js - 英文词典
// user_dict.js - 用户词典
```

### 主题配置
```javascript
// DefaultTheme.js - 默认主题
// DarkTheme.js - 深色主题  
// LightTheme.js - 浅色主题
```

### 系统配置
```javascript
// DefaultConfig.js - 默认配置
// DeviceConfig.js - 设备特定配置
```

## 10. 枚举定义 (enums/) Roadmap

```javascript
// KeyboardType.js - 键盘类型枚举
// InputBoxType.js - 输入框类型枚举  
// InputMethodEvent.js - 事件类型枚举
// KeyBoardCondition.js - 键盘状态枚举
// InputboxCondition.js - 输入框状态枚举
// LinkEventType.js - 通信事件类型枚举
```

## 开发优先级建议

### Phase 1: 核心框架 + 基础UI
- UIComponent, Cursor, TextLine
- EventBus, ConfigManager
- BaseInputBox, NormalInputBox
- InputBoxFactory

### Phase 2: 键盘系统基础
- BaseKeyboard, EnglishKeyboard  
- KeyboardFactory
- 基础工具类

### Phase 3: 输入法引擎
- IInputEngine, EnglishInputEngine
- 拼音输入引擎基础

### Phase 4: 高级功能
- 中文拼音完整实现
- 多种键盘布局
- 主题系统

### Phase 5: 优化扩展
- 性能优化
- 新输入法类型
- 自定义主题

这个Roadmap提供了清晰的开发路径，每个模块都有明确的职责和接口定义，便于团队协作和后续扩展。