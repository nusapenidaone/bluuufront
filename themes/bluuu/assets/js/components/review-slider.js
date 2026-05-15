const ReviewSlider = {
    props: ['reviews', 'reviews_total'],
    template: `

    
        <div class=" row g-3 align-items-center justify-content-xl-start justify-content-center">
            <div class="col-auto">
                <a class="btn btn-outline" href="https://bluuu.tours/reviews">
                    <span class="me-2">All reviews</span>
                    <i class="arrow-icon-blue"></i>
                </a>
            </div>
            <div class="col-xl"></div>
            <div class="col-auto">
                <div class="slider-nav d-xl-flex d-none ">
                    <div class="slider-prev bg-white bg-200-hover" @click="slidePrev"></div>
                    <div class="slider-next bg-white bg-200-hover" @click="slideNext"></div>
                </div>
            </div>
        </div>
        <div class="position-relative mt-4">
            <div class="left-50 top position-absolute z-1 pt-4 d-xl-none">
                <div class="swipe"></div>
            </div>
            <div class="splide feeds-slider" role="group" aria-label="feeds slider" ref="feedsSlider">
                <div class="splide__track">
                    <ul class="splide__list">
                        <li class="splide__slide" v-for="r in reviews" v-bind:key="r.id">
                            <div class="h-100">
                                <div class="w-100 ratio-3x2">
                                    <img v-bind:data-splide-lazy="r.img_with_thumbs.thumb1" alt="review" class="w-100 rounded-1 ratio-3x2 img" />
                                </div>
                                <div class="mt-3">
                                    <div class="fz-1 fw-600" v-text="r.name"></div>
                                    <div class="d-flex align-items-center">
                                        <div class="stars fz-07"><i class="star-icon" v-for="r in r.rating"></i></div>
                                        <span class="fz-08 ms-2 c-500 " v-text="r.source.name"></span>
                                    </div>
                                    <div class="mt-3 truncate c-500" v-html="r.text"></div>
                                    <div class="text-end mt-2 fz-09 c-500 fw-500" v-text="formatDate(r.date)"></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="h-1 bg-black-10 my-1"></div>
    `,
    data() {
        return {
            slider: null
        }
    },
    mounted() {
        this.slider = new Splide(this.$refs.feedsSlider, {
            label: 'Reviews',
            lazyLoad: "sequential",
            perPage: 3,
            gap: "1.5rem",
            preloadPages: 1,
            rewind: true,
            pagination: false,
            arrows: false,
            autoScroll: false,
            breakpoints: {
                768: {
                    perPage: 2,
                    gap: "0.5rem"
                },
                480: {
                    gap: "1rem",
                    perPage: 1,
                    padding: {
                        left: 0,
                        right: '4.5rem'
                    },
                    focus: 0,
                },
            },
        }).mount();
    },
    methods: {
        formatDate(dateStr) {
            const d = new Date(dateStr);
            return d.toLocaleDateString('ru-RU');
        },
        slidePrev() {
            if (this.slider) this.slider.go('<');
        },
        slideNext() {
            if (this.slider) this.slider.go('>');
        },
    },
};