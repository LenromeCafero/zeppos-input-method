以下是旧代码迁移到新架构的对应关系表：

## 核心框架迁移对应关系

| 旧代码文件 | 新架构位置 | 迁移说明 |
|------------|------------|----------|
| `inputMethod.js` - `InputMethod` 类 | `core/InputMethod.js` | 主控制器逻辑基本保留，按新架构重构 |
| 全局变量和常量 | `enums/` 各枚举文件 | 将散落的常量整理到对应枚举文件 |
| 事件类型定义 | `enums/InputMethodEvent.js` | 集中管理事件类型 |

## 输入框系统迁移对应关系

| 旧代码 | 新架构位置 | 迁移说明 |
|--------|------------|----------|
| `inputboxLib.js` - `InputBoxLib[0]` (NORMAL类) | `components/inputbox/implementations/NormalInputBox.js` | 普通输入框实现迁移 |
| `Cursor` 类 | `components/ui/Cursor.js` | 光标组件独立提取 |
| `TextLine` 类 | `components/ui/TextLine.js` | 文本行组件独立提取 |
| 输入框触控处理逻辑 | `components/inputbox/handlers/InputBoxTouchHandler.js` | 触控逻辑分离 |
| 输入框通信逻辑 | `components/inputbox/handlers/InputBoxLinkHandler.js` | 通信逻辑分离 |

## 键盘系统迁移对应关系

| 旧代码 | 新架构位置 | 迁移说明 |
|--------|------------|----------|
| `keyboardLib.js` - `BaseKeyboard` 类 | `components/keyboard/base/BaseKeyboard.js` | 基础键盘类重构 |
| `keyboardLib.js` - `EN` 类 | `components/keyboard/implementations/EnglishKeyboard.js` | 英文键盘实现 |
| `keyboardLib.js` - `ZH_CN_PY` 类 | `components/keyboard/implementations/ChinesePinyinKeyboard.js` | 中文拼音键盘实现 |
| `getKeyIndex()` 方法 | `components/keyboard/base/BaseKeyboard.js` | 按键索引计算保留 |
| `getKeyBorder()` 方法 | `components/keyboard/base/BaseKeyboard.js` | 按键边界计算保留 |
| `longPress()` 方法 | `components/keyboard/handlers/LongPressHandler.js` | 长按逻辑分离 |
| `chooseWord()` 方法 | `components/keyboard/engines/PinyinInputEngine.js` | 拼音选词逻辑迁移到引擎 |

## 工具类和功能迁移

| 旧代码 | 新架构位置 | 迁移说明 |
|--------|------------|----------|
| `Fx` 类 | `utils/Fx.js` | 动画工具类保留并增强 |
| `click()` 函数 | `utils/Vibration.js` | 触觉反馈工具类 |
| `pinyin_dict_notone` | `data/dictionaries/pinyin_dict_notone.js` | 拼音字典数据迁移 |
| 主题配置数据 | `data/themes/DefaultTheme.js` | 主题配置集中管理 |
| 定时器管理 | `utils/TimerManager.js` | 定时器生命周期管理 |

## 具体代码迁移示例

### 1. 输入框链接事件处理迁移
```javascript
// 旧代码 (inputboxLib.js)
link(res) {
    switch (res.event) {
        case LINK_EVENT_TYPE.INPUT:
            this.text = this.text.substring(0, this.charAt) + res.data + this.text.substring(this.charAt);
            ++this.charAt;
            break;
        case LINK_EVENT_TYPE.DELETE:
            if (this.text.length) {
                this.text = this.text.substring(0, this.charAt - 1) + this.text.substring(this.charAt);
                --this.charAt;
            }
            break;
    }
}

// 新架构 → InputBoxLinkHandler.js
class InputBoxLinkHandler {
    process(inputBox, data) {
        switch (data.event) {
            case LinkEventType.INPUT:
                this.handleInput(inputBox, data);
                break;
            case LinkEventType.DELETE:
                this.handleDelete(inputBox, data);
                break;
        }
    }
}
```

### 2. 键盘触控事件迁移
```javascript
// 旧代码 (keyboardLib.js)
onTouch(event, info) {
    if (info.y < BOUNDARY_Y + FUNCTION_BAR_H) {
        return this.updateChooseWord(event, info);
    } else {
        // 键盘区域处理...
    }
}

// 新架构 → BaseKeyboard.js + TouchHandler.js
class BaseKeyboard {
    onTouch(event, info) {
        this.preTouch(event, info);
        const result = this.touchHandler.handle(event, info);
        this.postTouch(event, info, result);
        return result;
    }
}

class TouchHandler {
    handle(event, info) {
        if (this.isFunctionBarArea(info)) {
            return this.functionBarHandler.handle(event, info);
        } else {
            return this.keyAreaHandler.handle(event, info);
        }
    }
}
```

### 3. 拼音输入引擎迁移
```javascript
// 旧代码 (keyboardLib.js - ZH_CN_PY类)
chooseWord(inputText) {
    // 拼音匹配逻辑...
    const pinyinPart = this.extractPinyin(inputText);
    // 字典查找逻辑...
}

// 新架构 → PinyinInputEngine.js
class PinyinInputEngine {
    processInput(input, context) {
        const currentInput = context.currentInput + input;
        const pinyinPart = this.extractPinyin(currentInput);
        const candidates = this.matchPinyin(pinyinPart);
        
        return {
            committed: "",
            candidates,
            currentInput
        };
    }
}
```

## 状态管理迁移

| 旧状态管理 | 新架构方案 | 迁移说明 |
|------------|------------|----------|
| `this.condition` 标志位 | 各组件独立状态管理 | 状态逻辑分离到具体处理器 |
| `this.lastButton` | `TouchHandler` 管理 | 触控状态由专门处理器管理 |
| `this.chooseWordArray` | `PinyinInputEngine` 管理 | 候选词由输入引擎管理 |

## 事件通信迁移

| 旧通信方式 | 新架构方案 | 迁移说明 |
|------------|------------|----------|
| `this.father.link()` 直接调用 | `EventBus` 事件系统 | 通过事件总线解耦通信 |
| `res && this.inputbox.link(res)` | `eventBus.emit(InputMethodEvent.TEXT_CHANGE, data)` | 事件驱动架构 |
| 组件间直接方法调用 | 接口抽象 + 依赖注入 | 降低耦合度 |

## 配置管理迁移

| 旧配置方式 | 新架构方案 | 迁移说明 |
|------------|------------|----------|
| `dataManager.json` 全局访问 | `ConfigManager` 配置服务 | 集中配置管理 |
| 硬编码主题值 | `ThemeConfig` 主题配置类 | 主题系统抽象 |
| 分散的配置参数 | `InputMethodConfig` 统一配置 | 配置参数集中化 |

## 迁移策略建议

### 第一阶段：基础框架迁移
1. 创建新目录结构和枚举定义
2. 迁移 `UIComponent`, `Cursor`, `TextLine` 基础组件
3. 实现 `EventBus` 和 `ConfigManager`

### 第二阶段：输入框系统迁移  
1. 重构 `BaseInputBox` 和 `NormalInputBox`
2. 分离触控和链接处理器
3. 实现输入框工厂

### 第三阶段：键盘系统迁移
1. 重构 `BaseKeyboard` 基础类
2. 迁移 `EnglishKeyboard` 简单实现
3. 分离事件处理器

### 第四阶段：高级功能迁移
1. 实现拼音输入引擎
2. 迁移中文键盘功能
3. 完善工具类和主题系统

### 第五阶段：优化整合
1. 性能优化和内存管理
2. 错误处理和边界条件
3. 测试和调试完善

这种渐进式迁移策略可以确保在重构过程中系统始终可用，每个阶段都有可测试的成果。