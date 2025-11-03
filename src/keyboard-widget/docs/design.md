
## 重构优势

1. **开闭原则**：新增键盘类型或输入法引擎无需修改现有代码
2. **单一职责**：每个类专注于特定功能
3. **依赖注入**：通过配置和工厂模式解耦组件
4. **可测试性**：组件可以独立测试
5. **可维护性**：清晰的架构和职责分离
6. **可扩展性**：易于添加新功能和新输入法类型

这种设计使得系统可以轻松支持新的键盘布局、输入法引擎和UI主题，同时保持代码的清晰和可维护性。

基于面向对象重构方案的目录结构设计：

## 目录结构

```
input-method/
├── src/
│   ├── core/                    # 核心框架
│   │   ├── InputMethod.ts       # 主控制器
│   │   ├── EventBus.ts          # 事件总线
│   │   ├── ConfigManager.ts     # 配置管理
│   │   └── types.ts             # 类型定义
│   │
│   ├── components/              # 组件层
│   │   ├── ui/                  # UI基础组件
│   │   │   ├── UIComponent.ts
│   │   │   ├── Cursor.ts
│   │   │   ├── TextLine.ts
│   │   │   └── Button.ts
│   │   │
│   │   ├── inputbox/            # 输入框组件
│   │   │   ├── base/
│   │   │   │   ├── BaseInputBox.ts
│   │   │   │   ├── InputBoxConfig.ts
│   │   │   │   └── InputBoxTheme.ts
│   │   │   ├── handlers/
│   │   │   │   ├── InputBoxTouchHandler.ts
│   │   │   │   └── InputBoxLinkHandler.ts
│   │   │   ├── implementations/
│   │   │   │   ├── NormalInputBox.ts
│   │   │   │   ├── PasswordInputBox.ts
│   │   │   │   └── SearchInputBox.ts
│   │   │   └── factory/
│   │   │       └── InputBoxFactory.ts
│   │   │
│   │   └── keyboard/            # 键盘组件
│   │       ├── base/
│   │       │   ├── BaseKeyboard.ts
│   │       │   ├── KeyboardConfig.ts
│   │       │   ├── KeyboardTheme.ts
│   │       │   ├── KeyLayout.ts
│   │       │   └── KeyButton.ts
│   │       ├── engines/         # 输入法引擎
│   │       │   ├── IInputEngine.ts
│   │       │   ├── EnglishInputEngine.ts
│   │       │   ├── PinyinInputEngine.ts
│   │       │   ├── NumberInputEngine.ts
│   │       │   └── SymbolInputEngine.ts
│   │       ├── handlers/
│   │       │   ├── TouchHandler.ts
│   │       │   ├── LongPressHandler.ts
│   │       │   └── CandidateHandler.ts
│   │       ├── layouts/         # 键盘布局
│   │       │   ├── QwertyLayout.ts
│   │       │   ├── NumberLayout.ts
│   │       │   ├── SymbolLayout.ts
│   │       │   └── ChineseLayout.ts
│   │       ├── implementations/ # 具体键盘实现
│   │       │   ├── EnglishKeyboard.ts
│   │       │   ├── NumberKeyboard.ts
│   │       │   ├── ChinesePinyinKeyboard.ts
│   │       │   └── SymbolKeyboard.ts
│   │       └── factory/
│   │           └── KeyboardFactory.ts
│   │
│   ├── utils/                   # 工具类
│   │   ├── Animation.ts
│   │   ├── Fx.ts
│   │   ├── TextMeasurer.ts
│   │   ├── TimerManager.ts
│   │   └── Vibration.ts
│   │
│   ├── data/                    # 数据资源
│   │   ├── dictionaries/
│   │   │   ├── pinyin_dict_notone.ts
│   │   │   ├── english_dict.ts
│   │   │   └── user_dict.ts
│   │   ├── themes/
│   │   │   ├── DefaultTheme.ts
│   │   │   ├── DarkTheme.ts
│   │   │   └── LightTheme.ts
│   │   └── configs/
│   │       ├── DefaultConfig.ts
│   │       └── DeviceConfig.ts
│   │
│   └── enums/                   # 枚举定义
│       ├── KeyboardType.ts
│       ├── InputBoxType.ts
│       ├── InputMethodEvent.ts
│       ├── KeyBoardCondition.ts
│       ├── InputboxCondition.ts
│       └── LinkEventType.ts
│
├── resources/                   # 资源文件
│   ├── images/
│   │   ├── keyboard/
│   │   │   ├── button_normal.png
│   │   │   ├── button_pressed.png
│   │   │   └── background.png
│   │   ├── inputbox/
│   │   │   ├── background.png
│   │   │   └── mask.png
│   │   └── common/
│   │       ├── roundMark.png
│   │       └── icons/
│   │
│   └── fonts/                   # 字体文件（如果需要）
│
├── docs/                        # 文档
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DEVELOPMENT.md
│
└── tests/                       # 测试文件
    ├── unit/
    │   ├── core/
    │   ├── components/
    │   └── utils/
    └── integration/
        └── InputMethod.test.ts
```

## 主要类文件说明

### 核心框架 (core/)
- **InputMethod.ts** - 输入法主控制器，协调所有组件
- **EventBus.ts** - 事件发布订阅系统
- **ConfigManager.ts** - 配置管理和持久化
- **types.ts** - 全局类型定义和接口

### UI基础组件 (components/ui/)
- **UIComponent.ts** - 所有UI组件的基类
- **Cursor.ts** - 光标管理和动画
- **TextLine.ts** - 文本行渲染和滚动
- **Button.ts** - 通用按钮组件

### 输入框系统 (components/inputbox/)
- **BaseInputBox.ts** - 输入框抽象基类
- **NormalInputBox.ts** - 普通输入框实现
- **PasswordInputBox.ts** - 密码输入框实现
- **InputBoxFactory.ts** - 输入框工厂类
- **InputBoxTouchHandler.ts** - 输入框触控事件处理
- **InputBoxLinkHandler.ts** - 输入框通信处理

### 键盘系统 (components/keyboard/)
- **BaseKeyboard.ts** - 键盘抽象基类
- **EnglishKeyboard.ts** - 英文键盘实现
- **ChinesePinyinKeyboard.ts** - 中文拼音键盘实现
- **KeyboardFactory.ts** - 键盘工厂类
- **IInputEngine.ts** - 输入法引擎接口
- **PinyinInputEngine.ts** - 拼音输入引擎
- **QwertyLayout.ts** - QWERTY布局定义
- **TouchHandler.ts** - 触控事件处理
- **CandidateHandler.ts** - 候选词处理

### 工具类 (utils/)
- **Animation.ts** - 动画管理
- **Fx.ts** - 动画效果和插值
- **TextMeasurer.ts** - 文本测量工具
- **TimerManager.ts** - 定时器管理
- **Vibration.ts** - 触觉反馈

### 数据资源 (data/)
- **pinyin_dict_notone.ts** - 拼音字典
- **DefaultTheme.ts** - 默认主题配置
- **DefaultConfig.ts** - 默认系统配置

## 模块导入示例

```typescript
// 主入口文件
import { InputMethod } from './core/InputMethod';
import { ConfigBuilder } from './core/ConfigManager';
import { KeyboardType, InputBoxType } from './enums/KeyboardType';
import { DefaultTheme } from './data/themes/DefaultTheme';

// 组件导入
import { InputBoxFactory } from './components/inputbox/factory/InputBoxFactory';
import { KeyboardFactory } from './components/keyboard/factory/KeyboardFactory';

// 工具类导入
import { Animation } from './utils/Animation';
import { TextMeasurer } from './utils/TextMeasurer';
```

## 设计优势

1. **模块清晰**：按功能划分目录，职责明确
2. **易于扩展**：新增键盘类型只需在相应目录添加文件
3. **便于维护**：相关文件集中管理，查找修改方便
4. **支持多主题**：主题配置独立管理
5. **测试友好**：每个模块都可以独立测试
6. **文档完整**：专门的文档目录说明架构和使用

这种目录结构支持团队协作开发，新人可以快速理解系统架构，便于代码复用和维护。