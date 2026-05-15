const Step={
    props: ['step', 'next', 'back'],
    inject: ['order'],
    methods: {
        goBack(){
            this.order.step=this.back
        },
        goNext(){
            this.order.step=this.next
        }
    },
    template: `
        <div class="col-xl-8">
            <div class="rounded-15 py-5 px-xl-5 px-1 bg-white shadow position-relative">
                <div class="p-2 position-absolute start top">
                    <div class="btn btn-light btn-circle" v-on:click="goBack">
                        <svg width="13" viewBox="0 0 13 11" fill="none">
                            <path d="M2.413 6.19536H12.2422C12.6619 6.19536 13 5.89104 13 5.50303C13 5.12517 12.6619 4.81071 12.2422 4.81071H2.4214L5.50063 1.63564C5.77671 1.35414 5.75136 0.920483 5.43865 0.671956C5.12594 0.423427 4.65265 0.446251 4.37656 0.727747L0.190202 5.04402C-0.0689978 5.3103 -0.0604977 5.70338 0.198702 5.95951L4.37938 10.2682C4.65547 10.5497 5.12876 10.5826 5.44146 10.324C5.75417 10.0754 5.77953 9.64179 5.50344 9.36029L2.4242 6.18522L2.413 6.19536Z" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                <div class="row justify-content-center">
                    <div class="col-xl-6">
                        <div class="fz-15 fw-600 c-950 text-center" v-text="step.title"></div>
                        <div class="mt-2 c-500 text-center" v-html="step.description"></div>
                    </div>
                </div>

                <div class="row g-xl-3 g-2 mt-3">
                    <div class="col-xl-6" v-for="l in step.list">
                        <div class="border-black-10 rounded-1 p-3 h-100">
                            <div class="row align-items-center">
                                <div class="col-8">
                                   
                                        <div class="fw-600 c-950 mb-2" v-if="l.title" v-text="l.title"></div>
                                        
                                        <div class="c-500 fz-09" v-html="l.text"></div>
                                  
                                </div>
                                <div class="col-4">
                                    <div class="rounded bg-100 w-100">
                                        <img v-bind:src="'/storage/app/media/'+l.icon" alt="icon" class="w-100 ratio-1x1">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class=" mt-4 text-center" v-text="step.text" v-if="step.text"></div>
                </div>

                
                <div class="text-center mt-4">
                    <div class="btn btn-blue" v-on:click="goNext">
                        <span>Next step</span>
                        <svg width="13" class=" ms-2" viewBox="0 0 13 11" fill="none">
                            <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `
}