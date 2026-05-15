const ImageSlider = {
    props: ['images'],
    template: `
    <div class="splide" ref="slider">
      <div class="splide__track">
        <div class="splide__list">
          <div class="splide__slide" v-for="(image, index) in images" v-bind:key="index">
            <img v-bind:data-splide-lazy="image.path" class="w-100 ratio-16x9" alt="Slide image">
          </div>
        </div>
      </div>
    </div>
  `,
    mounted() {
        new Splide(this.$refs.slider, {
            lazyLoad: "nearby",
            type: 'loop',
            perPage: 1,
            gap: '1rem',
            pagination: true,
            arrows: true
        }).mount();
    },
};