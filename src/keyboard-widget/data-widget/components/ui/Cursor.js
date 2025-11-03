import { UIComponent } from './UIComponent.js';

export class Cursor extends UIComponent {
    constructor(config) {
        super();
        this.border = config.border;
        this.lineWidth = config.lineWidth || px(4);
        this.locX = config.locX || 0;
        this.lineHeight = config.lineHeight || px(40);
        this.color = config.color || 0x28c4ff;
        this.offsetX = config.offsetX || -2;
        
        this.flashTimer = null;
        this.flashShowing = true;
        this.fxInstance = null;
    }
    
    setFlash(enable) {
        if (this.flashTimer) {
            timer.stopTimer(this.flashTimer);
            this.flashTimer = null;
        }
        
        if (enable) {
            this.flashTimer = timer.createTimer(150, 350, () => {
                this.flashShowing = !this.flashShowing;
                if (this.widget) {
                    this.widget.setProperty(hmUI.prop.VISIBLE, this.flashShowing);
                }
            }, {});
        } else {
            if (this.widget) {
                this.widget.setProperty(hmUI.prop.VISIBLE, true);
            }
        }
    }
    
    onCreate() {
        this.widget = this.createWidget(hmUI.widget.FILL_RECT, {
            x: this.border.x + this.locX + this.offsetX,
            y: this.border.y + (this.border.h - this.lineHeight) / 2,
            w: this.lineWidth,
            h: this.lineHeight,
            color: this.color,
            radius: px(2)
        });
        this.setFlash(true);
    }
    
    move(locX, useFx = false) {
        if (useFx) {
            this.setFlash(false);
            
            if (this.fxInstance) {
                this.fxInstance.setEnable(false);
            }
            
            // 简化版动画实现
            const startX = this.locX;
            const duration = 100; // ms
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = progress * (2 - progress); // ease-out
                const currentX = startX + (locX - startX) * easeProgress;
                
                this.widget.setProperty(
                    hmUI.prop.X,
                    currentX + this.border.x + this.offsetX
                );
                this.locX = currentX;
                
                if (progress < 1) {
                    timer.createTimer(16, 0, animate, {});
                } else {
                    this.setFlash(true);
                }
            };
            
            animate();
        } else {
            this.locX = locX;
            if (this.widget) {
                this.widget.setProperty(
                    hmUI.prop.X,
                    locX + this.border.x + this.offsetX
                );
            }
        }
    }
    
    onDestroy() {
        this.setFlash(false);
    }
}