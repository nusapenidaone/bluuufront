const ProgramSlider={
    props: ['program'],
    data(){
        return{
            slider: null
        }
    },
    computed:{
        length(){
            return this.program.length;
        }
    },
    mounted() {
        this.slider= new Splide(this.$refs.slider, {
            perPage: 1,
            pagination: false,
            arrows: false,
            wheel: false,
            
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

    template:`
<div class="position-relative">
    <template v-if="length>1">
    <div class="d-xl-none position-absolute end top-50 z-1 pe-4">
        <div class="swipe"></div>
    </div>
    </template>
    <div class="splide" ref="slider">
        <div class="splide__track">
            <div class="splide__list">
                <template v-for="(program,index) in program">
                    <div class="splide__slide h-100">
                        <div class="row gx-2 align-items-center">
                            <div class="col-auto">
                                <span v-if="length>1" class="fz-15 lh-1 fw-600" v-html="program.name"></span>
                                <span v-else class="fz-15 lh-1 fw-600">Itinerary</span>
                            </div>
                            <div class="col-auto mt-xl-0" v-if="program.included">
                                <div class="p-2 bg-blue-10 c-blue rounded-3 fz-09">Included</div>
                            </div>
                        </div>
                        <div class="row align-items-center">
                            <div class="col-xl-7">
                                <template v-for="(l, index) in program.list" :key="index">
                                    <div class="d-flex align-items-center mt-3">
                                        <div class="flex-shrink">
                                            <img v-bind:src="'/storage/app/media'+l.icon" alt="icon" class="wh-2" />
                                        </div>
                                        <div class="ms-4">
                                            <div class="text-nowrap c-500">
                                                <span v-html="l.time"></span>&nbsp;<span>({{l.duration}})</span>
                                            </div>
                                            <div >
                                            <span class="fw-600" v-html="l.title"></span> &nbsp;
                                            <span class="c-500" v-html="l.description"></span>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <div class="col-xl-5 d-xl-block d-none">
                                <img src="/themes/bluuu/assets/images/map.webp" alt="program" class="w-100" />
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
    <div class="row mt-4 d-xl-flex d-none" v-if="length>1">
        <div class="slider-nav">
            <div class="slider-prev bg-white bg-200-hover" @click="slidePrev()"></div>
            <div class="slider-next bg-white bg-200-hover" @click="slideNext()"></div>
        </div>
    </div>
</div>
    `
}