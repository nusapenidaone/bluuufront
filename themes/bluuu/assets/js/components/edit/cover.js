const CoverSelector = {
    props: ['covers'],
    inject: ['order'],
    template: `
        <div class="p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer" v-on:click="show=!show">
                <div class="fw-600 flex-grow-1">Cancel for any reason</div>
                <div class="open-icon" v-bind:class="{ active : show==false }"></div>
            </div>
            <Transition>
                <template v-if="show">
                    <div class="mt-4">
                        <div v-for="cover in covers" v-bind:key="cover.id" class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3" v-on:click="save(cover)">
                                
                                <div class="col-xl-2 col-3">
                                    <img src="/themes/bluuu/assets/img/ticket.webp" alt="" class="w-100 ratio-1x1 rounded-1 img">
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex align-items-center">

                                            <div class="fw-600 me-2 flex-grow-1">
                                            
                                                <span class="text-nowrap me-2">
                                                    {{cover.name}}
                                                </span>
                                                <br class="d-xl-none">
                                                <span class="text-nowrap c-blue">
                                                    (<format-number v-bind:number="cover.per_boat ? cover.price : cover.price*order.members" />)
                                                </span>
                                            </div>

                                       
                                            <div class="radio-button fz-15" v-bind:class="{ active : order.cover_id==cover.id }"></div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 pe-4" v-html="cover.short_description"></div>
                                        <div class="mt-2"><span class="fz-09 tdu c-950 tdu" v-on:click.stop="showCover(cover)">How it Work</span></div>
                                       
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3" v-on:click="save(null)">
                                 <div class="col-xl-2 col-3">
                                    <img src="/themes/bluuu/assets/img/no-cover.webp" alt="" class="w-100 ratio-1x1 rounded-1 img">
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex align-items-center">
                                            <div class="fw-600 me-2 flex-grow-1">
                                                <span class="text-nowrap me-2">
                                                    No Coverage
                                                </span>
                                            </div>
                                            <div class="radio-button fz-15" v-bind:class="{ active : order.cover_id==null }"></div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 pe-4">
                                        If a cancellation occurs less than 24 hours prior to the scheduled start time of the experience, no refund or rescheduling will be granted, regardless of the reason for the cancellation, including but not limited to health conditions, incorrect booking date, or the inability of one member of the group to participate in the tour.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Transition>

            <Teleport to="body">
                <template >

                    <div id="cover-popup" class="popup-large bg-white p-4 content rounded-15 flex-xl-grow-0 flex-grow-1 rounded-md-0" v-if="cover">
                        <div class="fz-15 c-950 fw-600 text-center">Fully flexible ticket</div>
                        <div class="c-500 fz-09 text-center mt-2">X1 time reschedule of the trip date at no extra charge or receive <br>
                            a 100% refund if you need to cancel the trip for unforeseen events.</div>

                        <div class="mx-auto mt-4">
                            <img src="/themes/bluuu/assets/icons/ticket.svg" alt="ticket" class="w-100">
                        </div>
                        <div class="row gx-3 mt-3">
                            <div class="col-xl-12 mt-3">
                                <div class="border-black-10 h-100 p-4 rounded-1 d-flex flex-column align-items-start">
                                    <div class="bg-blue-10 c-blue rounded-3 px-3 py-2 lh-1 fw-600">Reasons for cancellation</div>
                                    
                                    <div class="mt-4" v-html="cover.description"></div>
                                </div>
                            </div>
                            <div class="col-xl-12 mt-3">
                                <div class="border-black-10 h-100 p-4 rounded-1 d-flex flex-column align-items-start">
                                    <div class=" bg-orange-50 c-orange rounded-3 px-3 py-2 lh-1 fw-600">Attention</div>
                                    
                                    <div class="mt-4">Refund does not apply to car transportation services if service has already been provided.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </template>
            </Teleport>

      </div>
      
      `,
    data() {
        return {
            show: false,
            active: this.order.cover_id,
            cover: null,
        };
    },
    methods: {
        showCover(cover){

            this.cover= cover;
            Fancybox.show([{
                src: "#cover-popup",
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
        save(cover) {
            
            if(cover==null){
                this.order.cover_id=null;
                this.active=null;
                this.$emit('close', ' Coverage removed');
            }else{
                if(cover.id==this.order.cover_id) return false;
                this.order.cover_id=cover.id;
                this.active=cover.id;
                this.$emit('close', cover.name + ' applied' );
            }

        }
    }
};