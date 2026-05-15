const PromoSlider = {
    props: ['slides'],
    template: `
        <div class="mt-5 rounded-35 position-relative">
          <div class="splide info-slider oh rounded-35 " role="group" ref="promoSlider">
            <div class="splide__track">
              <div class="splide__list">
                
                <div class="splide__slide" v-for="s in slides" :key="s.id">
                  <div class="position-relative">
                   
                    <picture>
                    <source v-if="s.images_with_thumbs.length>1" v-bind:srcset="s.images_with_thumbs[1].small" media="(max-width: 767px)">
                    <source v-else v-bind:srcset="s.images_with_thumbs[0].small" media="(max-width: 767px)">
                    <source v-bind:srcset="s.images_with_thumbs[0].large" media="(min-width: 768px)">
                    <img v-bind:data-splide-lazy="s.images_with_thumbs[0].large" alt="info slide" class="rounded-35 w-100 ratio-md-3x4 ratio-16x9" />
                    </picture>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-xl-block d-none" v-if="slides.length>1">
            <div class="info-slider-nav slider-nav">
              <div class="info-slider-prev slider-prev bg-100" @click="slidePrev"></div>
              <div class="info-slider-next slider-next bg-100" @click="slideNext"></div>
            </div>
          </div>
        </div>
    `,
     data() {
            return {
                slider: null
            }
     },
    mounted() {
        this.slider= new Splide(this.$refs.promoSlider, {
            lazyLoad: "nearby",
            arrows: false,
            loop: true,
            pagination: false,
             autoplay: false,
        }).mount();
    },
  methods: {

    slidePrev() {
      if (this.slider) this.slider.go('<');
    },
    slideNext() {
      if (this.slider) this.slider.go('>');
    },
  },
};


