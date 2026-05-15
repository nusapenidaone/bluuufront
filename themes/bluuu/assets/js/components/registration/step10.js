const Step10={

    inject: ['order'],
    template: `
        <div class="col-xl-8">
            <div class="rounded-15 py-5 px-xl-5 px-4 bg-white shadow position-relative">
                <div class="p-2 position-absolute start top">
                    <div class="btn btn-light btn-circle" v-on:click="order.step = order.is_first_class ? 12 : 9">
                        <svg width="13" viewBox="0 0 13 11" fill="none">
                            <path d="M2.413 6.19536H12.2422C12.6619 6.19536 13 5.89104 13 5.50303C13 5.12517 12.6619 4.81071 12.2422 4.81071H2.4214L5.50063 1.63564C5.77671 1.35414 5.75136 0.920483 5.43865 0.671956C5.12594 0.423427 4.65265 0.446251 4.37656 0.727747L0.190202 5.04402C-0.0689978 5.3103 -0.0604977 5.70338 0.198702 5.95951L4.37938 10.2682C4.65547 10.5497 5.12876 10.5826 5.44146 10.324C5.75417 10.0754 5.77953 9.64179 5.50344 9.36029L2.4242 6.18522L2.413 6.19536Z" fill="currentColor" />
                        </svg>
                    </div>
                </div>
                <div class="fz-15 fw-600 c-950 text-center" >Skip the morning line!</div>
                <div class="mt-2 c-500 text-center" >Pay your remaining balance online in advance!</div>
                                <div class="h-1 bg-black-10 my-3"></div>
                                <div class="c-950 pointer" v-on:click="order.pay=true">
                                    <div class="row justify-content-end gx-3 align-items-center">
                                        <div class="col">
                                            <div class="fw-600">
                                                Pay Now
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <div class="px-3 py-2 rounded-3 lh-1 fw-600 bg-blue-10">
                                                <format-number v-bind:number="order.collect" />
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <div class="radio-button fz-2" v-bind:class="{'active' :order.pay==true}"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="h-1 bg-black-10 my-3"></div>
                                <div class="c-950 pointer" v-on:click="order.pay=false">
                                    <div class="row justify-content-end gx-3 align-items-center">
                                        <div class="col">
                                            <div class="fw-600">
                                                Pay later
                                            </div>
                                        </div>
                                        <div class="col-auto">
                                            <div class="radio-button fz-2" v-bind:class="{'active' :order.pay==false}"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="h-1 bg-black-10 my-3"></div>
                <div class="text-center mt-4">



                <template v-if="loading==false">
                    <div class="btn btn-blue" v-on:click="order.step=11" v-if="order.pay==true">
                        <span>Next step</span>
                        <svg width="13" class=" ms-2" viewBox="0 0 13 11" fill="none">
                            <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div class="btn btn-blue" v-on:click="save()" v-else >
                        <span>Finish</span>
                        <svg width="13" class=" ms-2" viewBox="0 0 13 11" fill="none">
                            <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"></path>
                        </svg>
                    </div>

                </template>
                <template v-else>
                            <button class="btn btn-light mt-4" disabled>
                        <span class="me-2">Please wait </span>
                        <span class="preloading1">·</span>
                        <span class="preloading2">·</span>
                        <span class="preloading3">·</span>
                    </button>
                </template>

                </div>
            </div>
        </div>
    `,
    data(){
        return{
            loading: false
        }
    },
    methods:{
        save(){
            this.loading=true;
            this.$emit('save');
        }
    }
}