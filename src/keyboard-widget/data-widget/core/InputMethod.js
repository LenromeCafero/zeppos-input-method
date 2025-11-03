import { EventBus } from './EventBus.js';

import { InputBoxFactory } from '../components/inputbox/InputBoxFactory.js';
import { KeyboardFactory } from '../components/keyboard/KeyboardFactory.js';
import { InputEngineFactory } from '../components/keyboard/engines/InputEngineFactory.js';

import { InputMethodEvent } from '../enums/InputMethodEvent.js';
import { LinkEventType } from '../enums/LinkEventType.js';
import { KeyboardType } from '../enums/KeyboardType.js';

export class InputMethod {
    constructor(config) {
        this.config = config;
        this.eventBus = new EventBus();
        this.components = {};
        this.setupComponents();
        this.setupEventHandlers();
    }
    
    setupComponents() {
        // 创建输入框
        this.components.inputBox = InputBoxFactory.createInputBox(
            this.config.inputBoxType,
            {
                father: this,
                text: "",
                title: this.config.title,
                maxLength: this.config.maxLength,
                theme: this.config.theme.inputBox
            }
        );
        
        // 创建键盘
        this.components.keyboard = KeyboardFactory.createKeyboard(
            this.config.keyboardType,
            {
                father: this,
                singleKeyboard: false,
                theme: this.config.theme.keyboard
            }
        );
        
        // 创建输入引擎
        this.components.inputEngine = InputEngineFactory.createEngine(
            this.config.keyboardType
        );
        
        this.setupControlPlane();
    }
    
    setupEventHandlers() {
        this.eventBus.on(InputMethodEvent.TEXT_CHANGE, (data) => {
            this.handleTextChange(data);
        });
        
        this.eventBus.on(InputMethodEvent.INPUT_COMPLETE, () => {
            this.finish();
        });
        
        this.eventBus.on(InputMethodEvent.KEYBOARD_SWITCH, (type) => {
            this.switchKeyboard(type);
        });
    }
    
    setupControlPlane() {
        this.controlPlane = hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0, y: 0, w: px(480), h: px(480), text: ""
        });
        
        this.controlCallbacks = [
            (info) => this.handleTouch(hmUI.event.CLICK_DOWN, info),
            (info) => this.handleTouch(hmUI.event.CLICK_UP, info),
            (info) => this.handleTouch(hmUI.event.MOVE, info),
            (info) => this.handleTouch(hmUI.event.MOVE_IN, info),
            (info) => this.handleTouch(hmUI.event.MOVE_OUT, info)
        ];
        
        const events = [
            hmUI.event.CLICK_DOWN, hmUI.event.CLICK_UP, 
            hmUI.event.MOVE, hmUI.event.MOVE_IN, hmUI.event.MOVE_OUT
        ];
        
        events.forEach((event, index) => {
            this.controlPlane.addEventListener(event, this.controlCallbacks[index]);
        });
        
        this.controlLastY = 0;
    }
    
    handleTouch(event, info) {
        const BOUNDARY_Y = px(400);
        let result = null;
        
        if (info.y < BOUNDARY_Y) {
            // 输入框区域
            if (this.controlLastY >= BOUNDARY_Y) {
                result = this.components.keyboard.onTouch(hmUI.event.MOVE_OUT, info);
                result && this.components.inputBox.link(result);
            }
            result = this.components.inputBox.onTouch(event, info);
            result && this.components.keyboard.link(result);
        } else {
            // 键盘区域
            if (this.controlLastY < BOUNDARY_Y) {
                result = this.components.inputBox.onTouch(hmUI.event.MOVE_OUT, info);
                result && this.components.keyboard.link(result);
            }
            result = this.components.keyboard.onTouch(event, info);
            result && this.components.inputBox.link(result);
        }
        
        this.controlLastY = info.y;
        
        if (result && result.type === LinkEventType.FINISH) {
            this.finish();
        }
    }
    
    handleTextChange(data) {
        // 处理文本变化事件
        if (this.components.inputEngine) {
            const engineResult = this.components.inputEngine.processInput(
                data.text, 
                { cursorPosition: data.cursorPosition }
            );
            
            if (engineResult.committed) {
                this.components.inputBox.link({
                    event: LinkEventType.INPUT,
                    data: engineResult.committed
                });
            }
            
            if (engineResult.candidates.length > 0) {
                this.eventBus.emit(InputMethodEvent.CANDIDATE_UPDATE, {
                    candidates: engineResult.candidates
                });
            }
        }
    }
    
    switchKeyboard(type) {
        if (this.components.keyboard) {
            this.components.keyboard.destroy();
        }
        
        this.components.keyboard = KeyboardFactory.createKeyboard(type, {
            father: this,
            singleKeyboard: false,
            theme: this.config.theme.keyboard
        });
        
        this.components.inputEngine = InputEngineFactory.createEngine(type);
        this.components.keyboard.onCreate();
    }
    
    start() {
        this.components.inputBox.onCreate();
        this.components.keyboard.onCreate();
    }
    
    finish() {
        // 清理事件监听
        const events = [
            hmUI.event.CLICK_DOWN, hmUI.event.CLICK_UP, 
            hmUI.event.MOVE, hmUI.event.MOVE_IN, hmUI.event.MOVE_OUT
        ];
        
        events.forEach((event, index) => {
            this.controlPlane.removeEventListener(event, this.controlCallbacks[index]);
        });
        
        // 返回结果
        const result = this.getText();
        this.eventBus.emit(InputMethodEvent.INPUT_COMPLETE, { text: result });
    }
    
    getText() {
        return this.components.inputBox ? this.components.inputBox.getText() : "";
    }
    
    setText(text) {
        if (this.components.inputBox) {
            this.components.inputBox.setText(text);
        }
    }
    
    destroy() {
        if (this.components.inputBox) {
            this.components.inputBox.destroy();
        }
        if (this.components.keyboard) {
            this.components.keyboard.destroy();
        }
        this.eventBus.removeAll();
    }
}