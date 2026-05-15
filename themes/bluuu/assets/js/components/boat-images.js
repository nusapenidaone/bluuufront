const BoatImages = {
    props: ['image','images','youtube'],
    template: `
   <div>
   <div class="position-relative" v-if="isDesktop==false">
        <div class="splide" ref="slider" >
            <div class="splide__track">
                <div class="splide__list">
                    <div class="splide__slide" v-for="(image, index) in images" v-bind:key="index">
                            <div v-if="youtube && index==0" class="center play-icon" v-bind:href="youtube" data-video data-width="100%" data-height="100%" ></div>
                            <img v-bind:data-splide-lazy="image.thumb1" class="w-100 ratio-3x2" alt="Slide image" v-on:click="showImages">
                    </div>
                </div>
            </div>
        </div>
        <div class="position-absolute p-3 pb-5 bottom end"  v-on:click="showImages">
            <div class="bg-black-30 lh-1 p-2 rounded-0 c-white" >
                {{images.length}} &nbsp;photos
            </div>
        </div>
    </div>
    <div class="container-xl" v-else>
        <div class="position-relative pointer">
            <div class="row gx-3">
                <div class="col-xl-9">
                    <div  class="position-relative ratio-16x9">
                        <img v-bind:src="image" alt="tour image" class="img w-100 rounded-1 rounded-md-0 ratio-16x9 ratio-md-1x1 img" v-on:click="showImages()"/>

                        <a v-if="youtube" class="center play-icon" data-video data-width="100%" data-height="100%" v-bind:href="youtube"></a>

                    </div>
                </div>
                <div class="col-xl-3" >
                    <div class="h-100 d-flex flex-column">
                        <div class="flex-grow-1">
                            <img v-bind:src="images[1].thumb1" alt="tour-img" class="h-100 w-100 rounded-1 ratio-16x9 img" loading="lazy" v-on:click="showImages()"/>
                        </div>
                        <div class="mt-3"></div>
                        <div class="flex-grow-1">
                            <img v-bind:src="images[2].thumb1" alt="tour img" class="h-100 w-100 rounded-1 ratio-16x9 img" loading="lazy" v-on:click="showImages()"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-3 position-absolute left bottom ">
                <div class="row gx-3">
                    <div class="col-4">
                        <div class="blured-block h-100 d-flex align-items-center rounded-1 py-3 px-2">
                            <img src="/themes/bluuu/assets/img/trip-2025.webp" alt="choice" class="w-100" loading="lazy">
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="blured-block h-100 d-flex align-items-center rounded-1 py-3 px-2">
                            <img src="/themes/bluuu/assets/img/viator-2025.webp" alt="choice" class="w-100" loading="lazy">
                        </div>
                    </div>
                </div>
            </div>
            <div class="position-absolute p-4 end bottom">
                <div class="d-inline-flex  mb-xl-0 mb-5">
                    
                    <div class="btn btn-rounded btn-light pointer" v-on:click="showImages()">

                        <span >{{images.length}}&nbsp;photos</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

  `,
    data() {
        return {
            isDesktop: false,
            sliderInstance: null
        }
    },
    mounted() {
        this.checkScreen();
        window.addEventListener("resize", this.checkScreen);
        Fancybox.bind("[data-video]");
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.checkScreen);
        if (this.sliderInstance) this.sliderInstance.destroy();
    },
    methods: {
        checkScreen() {
            this.isDesktop = window.innerWidth >= 1199;

            this.$nextTick(() => {
                if (!this.isDesktop && this.$refs.slider && !this.sliderInstance) {
                    this.sliderInstance = new Splide(this.$refs.slider, {
                        perPage: 1,
                        pagination: false,
                        preloadPages: 1,
                        lazyLoad: 'nearby',
                        arrows: false
                    }).mount();
                }
            });
        },

        showImages() {
            const items = [];

            items.push(
                ...this.images.map(img => ({
                    src: img.original,
                    thumbSrc: img.thumb1
                }))
            );

            Fancybox.show(items);
        }
    }
};