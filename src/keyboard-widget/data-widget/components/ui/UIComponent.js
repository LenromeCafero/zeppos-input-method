export class UIComponent {
    constructor() {
        this.widgets = [];
        this.isDestroyed = false;
    }
    
    createWidget(config) {
        if (this.isDestroyed) {
            console.warn('Cannot create widget on destroyed component');
            return null;
        }
        
        const widget = hmUI.createWidget(config);
        this.widgets.push(widget);
        return widget;
    }
    
    destroy() {
        this.isDestroyed = true;
        this.widgets.forEach(widget => {
            try {
                hmUI.deleteWidget(widget);
            } catch (error) {
                console.error('Error deleting widget:', error);
            }
        });
        this.widgets = [];
        this.onDestroy();
    }
    
    onDestroy() {
        // 子类重写
    }
}