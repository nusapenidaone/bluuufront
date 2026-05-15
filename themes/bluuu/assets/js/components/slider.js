const ImageSlider = {
    props: ['images'],
    template: `
        <div class="splide" ref="slider">
          <div class="splide__track">
            <div class="splide__list">
              <div class="splide__slide ratio-1x1" v-for="(image, index) in images" v-bind:key="index">
                <img v-bind:data-splide-lazy="image.thumb" class="img w-100 ratio-1x1" alt="Slide image">
              </div>
            </div>
          </div>
        </div>
  `,
    mounted() {
        new Splide(this.$refs.slider, {
            perPage: 1,
            lazyLoad: 'sequential',
            pagination: false,
            arrows: true
        }).mount();
    },
};
