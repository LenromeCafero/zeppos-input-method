import { InputBoxType } from '../../enums/InputBoxType.js';
import { NormalInputBox } from './NormalInputBox.js';
import { PasswordInputBox } from './PasswordInputBox.js';
import { SearchInputBox } from './SearchInputBox.js';

/**
 * 输入框工厂类 - 负责创建和管理不同类型的输入框
 */
export class InputBoxFactory {
    // 输入框类型映射
    static inputBoxMap = {
        [InputBoxType.NORMAL]: NormalInputBox,
        [InputBoxType.PASSWORD]: PasswordInputBox,
        [InputBoxType.SEARCH]: SearchInputBox
    };

    /**
     * 创建输入框实例
     * @param {string} type - 输入框类型
     * @param {Object} config - 配置对象
     * @returns {BaseInputBox} 输入框实例
     */
    static createInputBox(type, config) {
        // 验证输入参数
        if (!this.isValidType(type)) {
            console.warn(`InputBoxFactory: 未知的输入框类型 "${type}"，使用默认类型`);
            type = InputBoxType.NORMAL;
        }

        if (!config || !config.father) {
            throw new Error('InputBoxFactory: 必须提供有效的配置和father引用');
        }

        try {
            const InputBoxClass = this.inputBoxMap[type];
            const validatedConfig = this.validateAndEnhanceConfig(type, config);
            
            console.log(`InputBoxFactory: 创建 ${type} 输入框`);
            return new InputBoxClass(validatedConfig);
            
        } catch (error) {
            console.error(`InputBoxFactory: 创建输入框失败 -`, error);
            // 降级方案：返回普通输入框
            return new NormalInputBox(this.getFallbackConfig(config));
        }
    }

    /**
     * 验证输入框类型是否有效
     * @param {string} type - 输入框类型
     * @returns {boolean} 是否有效
     */
    static isValidType(type) {
        return Object.values(InputBoxType).includes(type) && 
               this.inputBoxMap[type] !== undefined;
    }

    /**
     * 验证和增强配置
     * @param {string} type - 输入框类型
     * @param {Object} config - 原始配置
     * @returns {Object} 增强后的配置
     */
    static validateAndEnhanceConfig(type, config) {
        const enhancedConfig = { ...config };
        
        // 设置默认值
        enhancedConfig.text = enhancedConfig.text || '';
        enhancedConfig.title = enhancedConfig.title || this.getDefaultTitle(type);
        enhancedConfig.maxLength = enhancedConfig.maxLength || this.getDefaultMaxLength(type);
        
        // 类型特定的配置增强
        switch (type) {
            case InputBoxType.PASSWORD:
                enhancedConfig.maskChar = enhancedConfig.maskChar || '•';
                enhancedConfig.showLastChar = enhancedConfig.showLastChar !== false;
                break;
                
            case InputBoxType.SEARCH:
                enhancedConfig.placeholder = enhancedConfig.placeholder || '搜索...';
                enhancedConfig.showClearButton = enhancedConfig.showClearButton !== false;
                break;
        }
        
        // 验证必要配置
        this.validateRequiredConfig(enhancedConfig);
        
        return enhancedConfig;
    }

    /**
     * 获取默认标题
     * @param {string} type - 输入框类型
     * @returns {string} 默认标题
     */
    static getDefaultTitle(type) {
        const defaultTitles = {
            [InputBoxType.NORMAL]: '请输入',
            [InputBoxType.PASSWORD]: '输入密码',
            [InputBoxType.SEARCH]: '搜索'
        };
        return defaultTitles[type] || '请输入';
    }

    /**
     * 获取默认最大长度
     * @param {string} type - 输入框类型
     * @returns {number} 默认最大长度
     */
    static getDefaultMaxLength(type) {
        const defaultMaxLengths = {
            [InputBoxType.NORMAL]: 100,
            [InputBoxType.PASSWORD]: 20,
            [InputBoxType.SEARCH]: 50
        };
        return defaultMaxLengths[type] || 100;
    }

    /**
     * 验证必要配置
     * @param {Object} config - 配置对象
     */
    static validateRequiredConfig(config) {
        const required = ['father'];
        const missing = required.filter(key => !config[key]);
        
        if (missing.length > 0) {
            throw new Error(`InputBoxFactory: 缺少必要配置: ${missing.join(', ')}`);
        }
        
        if (config.maxLength && config.maxLength <= 0) {
            throw new Error('InputBoxFactory: maxLength 必须大于0');
        }
        
        if (config.text && config.text.length > (config.maxLength || 100)) {
            console.warn('InputBoxFactory: 初始文本长度超过最大长度限制，将被截断');
        }
    }

    /**
     * 获取降级配置
     * @param {Object} originalConfig - 原始配置
     * @returns {Object} 降级配置
     */
    static getFallbackConfig(originalConfig) {
        return {
            ...originalConfig,
            type: InputBoxType.NORMAL,
            title: '输入框'
        };
    }

    /**
     * 获取所有可用的输入框类型
     * @returns {string[]} 类型数组
     */
    static getAvailableTypes() {
        return Object.keys(this.inputBoxMap);
    }

    /**
     * 获取输入框类型的显示名称
     * @param {string} type - 输入框类型
     * @returns {string} 显示名称
     */
    static getTypeDisplayName(type) {
        const displayNames = {
            [InputBoxType.NORMAL]: '普通输入框',
            [InputBoxType.PASSWORD]: '密码输入框',
            [InputBoxType.SEARCH]: '搜索输入框'
        };
        return displayNames[type] || '未知类型';
    }

    /**
     * 注册自定义输入框类型
     * @param {string} type - 类型标识
     * @param {class} InputBoxClass - 输入框类
     */
    static registerInputBoxType(type, InputBoxClass) {
        if (this.inputBoxMap[type]) {
            console.warn(`InputBoxFactory: 类型 "${type}" 已存在，将被覆盖`);
        }
        
        // 验证类是否有效
        if (typeof InputBoxClass !== 'function') {
            throw new Error('InputBoxFactory: 必须提供有效的输入框类');
        }
        
        this.inputBoxMap[type] = InputBoxClass;
        console.log(`InputBoxFactory: 已注册自定义输入框类型 "${type}"`);
    }

    /**
     * 注销输入框类型
     * @param {string} type - 类型标识
     */
    static unregisterInputBoxType(type) {
        if (this.inputBoxMap[type]) {
            delete this.inputBoxMap[type];
            console.log(`InputBoxFactory: 已注销输入框类型 "${type}"`);
        } else {
            console.warn(`InputBoxFactory: 类型 "${type}" 不存在`);
        }
    }

    /**
     * 创建输入框的快捷方法
     */
    
    /**
     * 创建普通输入框
     * @param {Object} config - 配置对象
     * @returns {NormalInputBox} 普通输入框实例
     */
    static createNormalInputBox(config) {
        return this.createInputBox(InputBoxType.NORMAL, config);
    }

    /**
     * 创建密码输入框
     * @param {Object} config - 配置对象
     * @returns {PasswordInputBox} 密码输入框实例
     */
    static createPasswordInputBox(config) {
        return this.createInputBox(InputBoxType.PASSWORD, config);
    }

    /**
     * 创建搜索输入框
     * @param {Object} config - 配置对象
     * @returns {SearchInputBox} 搜索输入框实例
     */
    static createSearchInputBox(config) {
        return this.createInputBox(InputBoxType.SEARCH, config);
    }

    /**
     * 批量创建输入框（用于多输入场景）
     * @param {Array} inputBoxConfigs - 输入框配置数组
     * @returns {Object} 输入框实例映射
     */
    static createMultipleInputBoxes(inputBoxConfigs) {
        const inputBoxes = {};
        
        inputBoxConfigs.forEach((config, index) => {
            try {
                const type = config.type || InputBoxType.NORMAL;
                const name = config.name || `inputBox_${index}`;
                
                inputBoxes[name] = this.createInputBox(type, config);
                
            } catch (error) {
                console.error(`InputBoxFactory: 创建输入框 ${index} 失败 -`, error);
            }
        });
        
        return inputBoxes;
    }

    /**
     * 获取输入框的默认配置模板
     * @param {string} type - 输入框类型
     * @returns {Object} 配置模板
     */
    static getConfigTemplate(type) {
        const baseTemplate = {
            father: null,           // 必须：父级引用
            text: '',              // 初始文本
            title: '',             // 标题
            maxLength: 100,        // 最大长度
            theme: {}              // 主题配置
        };

        const typeSpecificTemplates = {
            [InputBoxType.PASSWORD]: {
                maskChar: '•',     // 掩码字符
                showLastChar: true // 是否临时显示最后一个字符
            },
            [InputBoxType.SEARCH]: {
                placeholder: '搜索...',    // 占位符文本
                showClearButton: true,     // 显示清除按钮
                onSearch: null             // 搜索回调函数
            }
        };

        return {
            ...baseTemplate,
            ...(typeSpecificTemplates[type] || {})
        };
    }
}

// 导出便捷的创建函数
export const createInputBox = InputBoxFactory.createInputBox.bind(InputBoxFactory);
export const createNormalInputBox = InputBoxFactory.createNormalInputBox.bind(InputBoxFactory);
export const createPasswordInputBox = InputBoxFactory.createPasswordInputBox.bind(InputBoxFactory);
export const createSearchInputBox = InputBoxFactory.createSearchInputBox.bind(InputBoxFactory);

export default InputBoxFactory;