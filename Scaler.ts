/* eslint-disable array-element-newline */
/* eslint-disable array-bracket-newline */
/**
 * @file 缩放器
 * @author loongfay
 */

interface ScalerOptions {
    MAX_SCALE: number;
    MIN_SCALE: number;
}

export default class Scaler {
    /**
     * 要拖动的目标节点元素
     */
    private readonly $aim: HTMLElement;
    /**
     * 目标节点原始宽度
     */
    private oriWidth = 0;
    /**
     * 目标节点原始高度
     */
    private oriHeight = 0;
    /**
     * 目标节点原始字号
     */
    private oriFontSize = 0;
    /**
     * 上一次拖动的 x 坐标
     */
    private lastX = 0;
    /**
     * 上一次拖动的 y 坐标
     */
    private lastY = 0;
    /**
     * 上一次的双指距离
     */
    private lastDistance = 0;
    /**
     * 最大缩放比例
     */
    private readonly MAX_SCALE = 5;
    /**
     * 最小缩放比例
     */
    private readonly MIN_SCALE = 0.5;

    constructor($aim: HTMLElement, options?: ScalerOptions) {
        if (!$aim) {
            throw new Error('document is required');
        }
        this.$aim = $aim;
        if (options) {
            for (const [k, v] of Object.entries(options)) {
                if (k in this) {
                    this[k as keyof this] = v;
                }
            }
        }
        this.init();
    }

    init() {
        this.$aim.style.setProperty('position', 'relative');
        this.$aim.parentElement?.style.setProperty('position', 'relative');
    }

    listen() {
        this.oriWidth = this.$aim.offsetWidth;
        this.oriHeight = this.$aim.offsetHeight;
        this.oriFontSize = parseInt(window.getComputedStyle(this.$aim).fontSize, 10);

        this.$aim.addEventListener('touchstart', (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;
                this.lastDistance = Math.sqrt(dx * dx + dy * dy);

                // 计算双指中心坐标 (x, y)
                this.lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                this.lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            }
            else {
                // 单指触点坐标 (x, y)
                this.lastX = e.touches[0].clientX;
                this.lastY = e.touches[0].clientY;
            }
        });

        this.$aim.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.cancelable) {
                e.preventDefault();
            }

            let moveX = 0;
            let moveY = 0;
            let diffX = 0;
            let diffY = 0;

            if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const scale = distance / this.lastDistance;

                const width = this.$aim.offsetWidth * scale;
                const oriScale = Math.max(Math.min(width / this.oriWidth, this.MAX_SCALE), this.MIN_SCALE);

                const adjustWidth = this.oriWidth * oriScale;
                const adjustHeight = this.oriHeight * oriScale;
                const adjustFontsize = Math.floor(this.oriFontSize * oriScale);

                this.$aim.style.setProperty('width', `${adjustWidth}px`);
                this.$aim.style.setProperty('height', `${adjustHeight}px`);
                this.$aim.style.setProperty('font-size', `${adjustFontsize}px`);

                this.lastDistance = distance;

                moveX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                moveY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                diffX = moveX - this.lastX;
                diffY = moveY - this.lastY;
            }
            else {
                moveX = e.touches[0].clientX;
                moveY = e.touches[0].clientY;
                diffX = moveX - this.lastX;
                diffY = moveY - this.lastY;
            }

            const top = this.$aim.offsetTop + diffY;
            const left = this.$aim.offsetLeft + diffX;

            // 设置四周安全距离为 50px
            const SAFE_D = 50;
            const {offsetWidth: containerWidth, offsetHeight: containerHeight} = this.$aim.parentElement || this.$aim;
            const adjustTop = Math.max(Math.min(top, containerHeight - SAFE_D), -this.$aim.offsetHeight + SAFE_D);
            const adjustLeft = Math.max(Math.min(left, containerWidth - SAFE_D), -this.$aim.offsetWidth + SAFE_D);

            this.$aim.style.setProperty('top', `${adjustTop}px`);
            this.$aim.style.setProperty('left', `${adjustLeft}px`);

            this.lastX = moveX;
            this.lastY = moveY;
        });
    }

    reset() {
        if (!this.oriWidth || !this.oriHeight) {
            return;
        }
        this.$aim.style.setProperty('top', `${0}px`);
        this.$aim.style.setProperty('left', `${0}px`);
        this.$aim.style.setProperty('width', `${this.oriWidth}px`);
        this.$aim.style.setProperty('height', `${this.oriHeight}px`);
        this.$aim.style.setProperty('font-size', `${this.oriFontSize}px`);
    }
}
