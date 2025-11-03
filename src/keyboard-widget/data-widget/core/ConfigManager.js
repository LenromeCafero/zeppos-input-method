export class InputMethodConfig {
    constructor(theme, keyboardType, inputBoxType, maxLength = 100, title = "请输入") {
        this.theme = theme;
        this.keyboardType = keyboardType;
        this.inputBoxType = inputBoxType;
        this.maxLength = maxLength;
        this.title = title;
    }
}

export class ConfigBuilder {
    constructor() {
        this.config = {};
    }
    
    setTheme(theme) {
        this.config.theme = theme;
        return this;
    }
    
    setKeyboardType(keyboardType) {
        this.config.keyboardType = keyboardType;
        return this;
    }
    
    setInputBoxType(inputBoxType) {
        this.config.inputBoxType = inputBoxType;
        return this;
    }
    
    setMaxLength(maxLength) {
        this.config.maxLength = maxLength;
        return this;
    }
    
    setTitle(title) {
        this.config.title = title;
        return this;
    }
    
    build() {
        return new InputMethodConfig(
            this.config.theme,
            this.config.keyboardType,
            this.config.inputBoxType,
            this.config.maxLength,
            this.config.title
        );
    }
}