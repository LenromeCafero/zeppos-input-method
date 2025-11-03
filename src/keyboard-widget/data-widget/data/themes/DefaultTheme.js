/**
 * 默认主题配置 - 基于旧代码还原
 */
export const DefaultTheme = {
    inputBox: {
        background: {
            type: "img",
            src: "image/inputbox_background.png" // 需要根据实际资源调整路径
        },
        inputBoxMask: {
            src: "image/inputbox_mask.png" // 旧代码中的 inputBoxMask
        },
        finishBtn: {
            normal_color: 0xffffff,           // 旧代码中默认白色
            press_color: 0x28c4ff             // 按压时蓝色
        }
    },
    keyboard: {
        background: {
            type: "img",                      // 旧代码中使用图片背景
            src: "image/keyboard_background.png" // 需要根据实际资源调整
        },
        functionBar: {
            type: "img",                      // 功能栏使用图片
            src: "image/function_bar.png"     // 需要根据实际资源调整
        },
        button: {
            src: "image/keyboard_button.png",     // 普通按钮图片
            src_up: "image/keyboard_button_up.png", // 大写状态按钮图片
            press_color: 0x28c4ff,             // 按压边框颜色 - 蓝色
            color: 0xffffff,                   // 正常边框颜色
            radius: px(8)                      // 圆角半径
        }
    },
    animation: {
        duration: 200,                         // 动画时长(ms)
        easing: "easeOutQuad"                  // 缓动函数
    }
};

/**
 * 备选主题 - 如果图片资源不存在，使用纯色主题
 */
export const DefaultFallbackTheme = {
    inputBox: {
        background: {
            type: "rect",
            color: 0x2a2a2a,                   // 深灰色背景
            radius: px(10)                     // 圆角
        },
        inputBoxMask: {
            src: ""                            // 无遮罩
        },
        finishBtn: {
            normal_color: 0xffffff,            // 白色文字
            press_color: 0x28c4ff              // 按压时蓝色
        }
    },
    keyboard: {
        background: {
            type: "rect",
            color: 0x1a1a1a,                   // 深黑色背景
            radius: 0
        },
        functionBar: {
            type: "rect",
            color: 0x2a2a2a,                   // 稍浅的灰色
            radius: 0
        },
        button: {
            src: "",                           // 无图片，使用默认样式
            src_up: "",
            press_color: 0x28c4ff,             // 蓝色按压效果
            color: 0x444444,                   // 按钮默认颜色
            radius: px(6)                      // 较小圆角
        }
    },
    animation: {
        duration: 200,
        easing: "easeOutQuad"
    }
};

/**
 * 根据设备能力返回合适的主题
 */
export function getDefaultTheme() {
    // 检查图片资源是否存在，如果不存在则使用备选主题
    // 这里可以添加更复杂的资源检测逻辑
    try {
        // 简单检查，实际使用时需要更完善的资源检测
        return DefaultTheme;
    } catch (error) {
        console.warn("使用备选主题:", error);
        return DefaultFallbackTheme;
    }
}

/**
 * 深色主题变体
 */
export const DarkTheme = {
    inputBox: {
        background: {
            type: "rect",
            color: 0x1e1e1e,
            radius: px(10)
        },
        inputBoxMask: {
            src: ""
        },
        finishBtn: {
            normal_color: 0x28c4ff,
            press_color: 0x1e90ff
        }
    },
    keyboard: {
        background: {
            type: "rect",
            color: 0x0f0f0f,
            radius: 0
        },
        functionBar: {
            type: "rect",
            color: 0x1a1a1a,
            radius: 0
        },
        button: {
            src: "",
            src_up: "",
            press_color: 0x28c4ff,
            color: 0x333333,
            radius: px(6)
        }
    },
    animation: {
        duration: 200,
        easing: "easeOutQuad"
    }
};

/**
 * 浅色主题变体
 */
export const LightTheme = {
    inputBox: {
        background: {
            type: "rect",
            color: 0xf5f5f5,
            radius: px(10)
        },
        inputBoxMask: {
            src: ""
        },
        finishBtn: {
            normal_color: 0x333333,
            press_color: 0x28c4ff
        }
    },
    keyboard: {
        background: {
            type: "rect",
            color: 0xffffff,
            radius: 0
        },
        functionBar: {
            type: "rect",
            color: 0xe0e0e0,
            radius: 0
        },
        button: {
            src: "",
            src_up: "",
            press_color: 0x28c4ff,
            color: 0xcccccc,
            radius: px(6)
        }
    },
    animation: {
        duration: 200,
        easing: "easeOutQuad"
    }
};

/**
 * 主题工具函数
 */
export const ThemeUtil = {
    /**
     * 获取主题配置，支持回退机制
     */
    getTheme(themeName = "default") {
        const themes = {
            default: DefaultTheme,
            dark: DarkTheme,
            light: LightTheme,
            fallback: DefaultFallbackTheme
        };
        
        return themes[themeName] || themes.default;
    },
    
    /**
     * 验证主题配置的完整性
     */
    validateTheme(theme) {
        const requiredPaths = [
            'inputBox.background',
            'inputBox.finishBtn', 
            'keyboard.background',
            'keyboard.functionBar',
            'keyboard.button'
        ];
        
        for (const path of requiredPaths) {
            const keys = path.split('.');
            let current = theme;
            for (const key of keys) {
                if (!current || !current[key]) {
                    console.warn(`主题配置缺少: ${path}`);
                    return false;
                }
                current = current[key];
            }
        }
        return true;
    },
    
    /**
     * 合并主题配置（深合并）
     */
    mergeThemes(baseTheme, overrideTheme) {
        const result = JSON.parse(JSON.stringify(baseTheme));
        
        function mergeDeep(target, source) {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeDeep(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        }
        
        return mergeDeep(result, overrideTheme);
    },
    
    /**
     * 根据设备特性调整主题
     */
    adaptThemeForDevice(theme, deviceInfo) {
        const adapted = JSON.parse(JSON.stringify(theme));
        
        // 根据屏幕尺寸调整
        if (deviceInfo.width < 400) {
            // 小屏幕设备调整
            adapted.inputBox.background.radius = px(6);
            adapted.keyboard.button.radius = px(4);
        }
        
        // 根据设备形状调整（圆形/方形）
        if (deviceInfo.screenShape === 'round') {
            // 圆形设备特殊处理
            adapted.keyboard.background.radius = px(20);
        }
        
        return adapted;
    }
};

export default DefaultTheme;