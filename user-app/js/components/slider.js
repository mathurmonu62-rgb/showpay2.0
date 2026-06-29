import { userDbApi } from '../config/supabase.js';

export class SliderComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentIndex = 0;
        this.timer = null;
        this.slidesData = [];
    }

    async render() {
        if (!this.container) return;
        this.slidesData = await userDbApi.select('slider_images', { is_enabled: true }, { column: 'display_order', ascending: true });
        
        if (this.slidesData.length === 0) {
            this.container.innerHTML = '<div class="slider-slide active" style="background-color: var(--primary-light);"><div class="slider-overlay"><div class="slider-title" style="color: var(--primary);">Welcome to ShowPay</div></div></div>';
            return;
        }

        this.container.innerHTML = this.slidesData.map((s, i) => `
            <div class="slider-slide ${i === 0 ? 'active' : ''}" style="background-image: url('${s.image_url}');">
                <div class="slider-overlay">
                    <div class="slider-title">${s.title}</div>
                </div>
            </div>
        `).join('');

        this.startAutoPlay();
    }

    startAutoPlay() {
        if (this.timer) clearInterval(this.timer);
        const slides = this.container.querySelectorAll('.slider-slide');
        if (slides.length <= 1) return;

        this.timer = setInterval(() => {
            slides[this.currentIndex].classList.remove('active');
            this.currentIndex = (this.currentIndex + 1) % slides.length;
            slides[this.currentIndex].classList.add('active');
        }, 3000);
    }
}
