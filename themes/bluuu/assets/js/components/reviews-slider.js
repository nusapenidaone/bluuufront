const ReviewsSlider = {
  props: ['reviews','reviews_total'],
  template: `
        <div class="py-xl-5 py-4"></div>
        <div class="bg-white rounded-3 shadow mt-5 position-relative">
            <div class="px-xl-5 px-4 pt-5">
                <div class="row gx-2 justify-content-xl-between justify-content-center">
                    <div class="col-auto order-xl-1">
                        <div class="d-flex justify-content-center align-items-center fz-3">
                            <div class="gold-left"></div>
                            <div class="fw-600 ps-2"> {{reviews_total.toLocaleString('en-US')}}</div>
                            <div class="gold-right"></div>
                        </div>
                        <div class="text-center fw-600 fz-12">Verified revews</div>
                    </div>
                    <div class="col-xl-6 text-md-center mt-xl-0 mt-4">
                        <h2 class="fz-25 fw-600 lh-11">
                            {{text.title}}
                        </h2>
                        <div class="mt-3 c-500 fz-12">
                            {{text.description}}
                        </div>
                    </div>
                </div>
                <div class="row gx-2 align-items-center mt-4">
                    <div class="col">
                        <a class="btn btn-outline" href="https://bluuu.tours/reviews">
                            <span class="me-2">All reviews</span>
                            <i class="arrow-icon-blue"></i>
                        </a>
                    </div>
                    <div class="col-auto">
                        <div class="slider-nav bg-100 p-2">
                            <div class="slider-prev bg-white bg-200-hover" @click="slidePrev"></div>
                            <div class="slider-next bg-white bg-200-hover" @click="slideNext"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-2 rounded-25 mt-xl-4 oh mt-3">
                <div class="splide feeds-slider" role="group" aria-label="feeds slider" ref="feedsSlider">
                    <div class="splide__track">
                        <ul class="splide__list">
                            <li class="splide__slide" v-for="r in reviews" v-bind:key="r.id">
                                <div class="bg-100 rounded-3 p-2 h-100">
                                    <img v-bind:data-splide-lazy="r.img_with_thumbs.thumb1" alt="review" class="img ratio-3x2 w-100 rounded-25" />

                                <div class="p-4">
                                    <div class="fz-1 fw-600" v-text="r.name"></div>
                                    <div class="d-flex align-items-center">
                                        <div class="stars fz-07"><i class="star-icon" v-for="r in r.rating"></i></div>
                                        <span class="fz-08 ms-2 c-500 " v-text="r.source.name"></span>
                                    </div>
                                    <div class="mt-3 truncate c-500" v-html="r.text"></div>
                                    <div class="text-end mt-2 fz-09 c-500 fw-500" v-text="formatDate(r.date)"></div>
                                </div>

                                    <div class="p-xl-4 p-3 d-none">
                                        <div class="d-flex align-items-center">
                                            <div class="avatar" v-text="r.name.slice(0, 1)"></div>
                                            <div class="ms-3">
                                                <div class="fz-15" v-text="r.name"></div>
                                                <span class="c-500" v-text="r.source.name"></span>
                                            </div>
                                        </div>
                                        <div class="fz-09 c-600 d-flex align-items-center mt-4">
                                            <div class="stars fz-09">
                                                <i class="star-icon" v-for="r in r.rating"></i>
                                            </div>
                                            <span class="ms-3" v-text="formatDate(r.date)"></span>
                                        </div>
                                        <div class="c-600 mt-4 truncate" v-html="r.text">
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
  `,
       data() {
            return {
                slider: null,
                text:{
                    title:"What our guests say",
                    description:"Our travelers say it best. Check out real reviews from adventurers who’ve snorkeled, sunned, and sailed with us, and see why our tours are the highlight of so many Bali trips."
                }
            }
     },
  mounted() {
    this.slider = new Splide(this.$refs.feedsSlider, {
        label: 'Reviews',
        lazyLoad: "nearby",
        perPage: 3,
        gap: "0.5rem",
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
                perPage: 1
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


