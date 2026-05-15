const ProgramSelector={
  props: {
    programs: {
      type: Array,
      required: true
    },
  },
    inject: ['order'],

    template:`
        <div class="p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer" v-on:click="show=!show">
                <div class="fw-600 flex-grow-1">
                <span v-if="programs.length>1">Select Itinerary</span>
                <span v-else>Itinerary</span>
                </div>
                
                <div class="open-icon" v-bind:class="{ active : show==false }"></div>
            </div>
            <Transition>
                <template v-if="show">
                    <div class="mt-4">
                        <div v-for="program in programs" v-bind:key="program.id" class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3" v-on:click="save(program)">
                                <div class="col-xl-2 col-3">
                                    <img v-bind:src="program.images_with_thumbs[0]?.thumb" alt="" class="w-100 ratio-1x1 rounded-1 img">
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex align-items-center">
                                            <div class="fw-600 me-2 flex-grow-1">
                                                <span v-text="program.name"></span><span v-if="program.included" class="px-2 ms-2 fz-09 bg-blue-50 c-blue rounded-3">included</span>
                                            </div>
                                            <div v-if="programs.length>1" class="radio-button fz-15" v-bind:class="{ active : order.program_id==program.id }"></div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 truncate-2 pe-xl-5" v-html="program.description"></div>
                                        <div class="flex-grow-1 mt-2"></div>
                                        <div><span class="fz-09 tdu c-950 tdu" v-on:click.stop="showItinerary(program)">Full Itinerary</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Transition>
            <Teleport to="body">
                <template>
                    <div class="popup-large bg-white p-4  rounded-15 flex-xl-grow-0 flex-grow-1 rounded-md-0" id="itinerary-popup" v-if="program">
                    
                        <div class="row align-items-center">
                            <div class="col-xl-4">
                                  <div class="rounded-1 oh">
                                    <slider v-bind:images="program.images_with_thumbs" :key="program.id"></slider>
                                 </div>
                            </div>
                            <div class="col-xl-8 mt-4 content">
                                <div class="fw-600 fz-15 c-950" v-text="program.name"></div>
                                <div class="c-500 mt-3 pe-xl-4" v-html="program.description"></div>
                                
                            </div>
                            <div class="col-12 mt-4 content">
                            <div class="h-1 bg-black-10"></div>
                            </div>
                            <div class="col-xl-7 mt-4">
                                <template v-for="(l, index) in program.list" :key="index">
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="flex-shrink">
                                            <img v-bind:src="'/storage/app/media'+l.icon" alt="icon" class="wh-25" />
                                        </div>
                                        <div class="ms-4">
                                            <div class="text-nowrap c-500">
                                                <span v-text="l.time"></span>&nbsp;<span >({{l.duration}})</span>
                                            </div>
                                            <div>
                                            <span class="fw-600" v-html="l.title"></span>&nbsp;
                                            <span v-html="l.description" class="c-500"></span>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <div class="col-xl-5 mt-4">
                                <img src="/themes/bluuu/assets/images/map.webp" alt="program" class="w-100" />
                            </div>
                        </div>
                    </div>
                </template>
            </Teleport>
        </div>
    `,
    data(){
        return{
            show: false,
            program: null,
            active: this.order.program_id,
        }
    },
    methods:{
        showItinerary(program){

            this.program= program;
            Fancybox.show([{
                src: "#itinerary-popup",
                type: "inline"
            }], {
                
                closeExisting: false,
                dragToClose: false,
                keyboard: false,
                click: false,
                compact: true,
                autoFocus: false,
            });

        },
        save(program){
            if(program.id==this.order.program_id) return false;
            this.order.program_id=program.id;
            this.$emit('close',program.name + " applied");
        }
    },
    computed: {

    },
}