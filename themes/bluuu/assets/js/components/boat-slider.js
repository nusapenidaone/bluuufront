const BoatSlider = {
  props: {
    link: {
        type: String,
        default: "https://bluuu.tours"
    },
    images: {
      type: Array,
      required: true
    },
    more: {
      type: Boolean,
      default: false
    }
  },
    template: `
    <div class="splide" ref="slider">
      <div class="splide__track">
        <div class="splide__list">
          <div class="splide__slide" v-for="(image, index) in images" v-bind:key="index">
            <div class="position-relative">
            <img v-bind:data-splide-lazy="image.thumb1" class="img w-100 ratio-3x2" alt="Slide image">
            <a v-bind:href="link" v-if="more==false && index === images.length - 1"  class="bg-black-50 position-absolute start end top bottom c-white d-flex align-items-center justify-content-center">Click to see more</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    mounted() {
        new Splide(this.$refs.slider, {
            perPage: 1,
            pagination: true,
            lazyLoad: 'nearby',
            preloadPages: 1,
            arrows: true
        }).mount();
    },
};