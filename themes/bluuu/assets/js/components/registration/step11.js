const Step11 ={
    inject: ['order'],
    template:`


        <div class="col-xl-8">
            <div class="rounded-15 py-5 px-xl-5 px-4 bg-white shadow position-relative">
                <div class="p-2 position-absolute start top">
                    <div class="btn btn-light btn-circle" v-on:click="order.step=10">
                        <svg width="13" viewBox="0 0 13 11" fill="none">
                            <path d="M2.413 6.19536H12.2422C12.6619 6.19536 13 5.89104 13 5.50303C13 5.12517 12.6619 4.81071 12.2422 4.81071H2.4214L5.50063 1.63564C5.77671 1.35414 5.75136 0.920483 5.43865 0.671956C5.12594 0.423427 4.65265 0.446251 4.37656 0.727747L0.190202 5.04402C-0.0689978 5.3103 -0.0604977 5.70338 0.198702 5.95951L4.37938 10.2682C4.65547 10.5497 5.12876 10.5826 5.44146 10.324C5.75417 10.0754 5.77953 9.64179 5.50344 9.36029L2.4242 6.18522L2.413 6.19536Z" fill="currentColor" />
                        </svg>
                    </div>
                </div>
                <div class="fz-15 fw-600 c-950 text-center" >Skip the morning line!</div>
                <div class="mt-2 c-500 text-center" >Pay your remaining balance online in advance!</div>
                                

                    <template v-for="m in methods">
                        <div class="h-1 bg-black-10 my-3"></div>
                        <div class="c-950 pointer" v-on:click="order.method=m.id">
                            <div class="row">
                                <div class="col">
                                    <div class="d-flex align-items-center">
                                    <img v-bind:src="m.icon" alt="card" height="20">
                                     <div class="ms-2 c-500 c-950 fz-12 fw-600" v-text="m.name"></div>
                                    </div>
                                    <div class="c-500 fz-09 mb-2" v-text="m.text"></div>
                                    <img v-if="m.icons!=''" v-bind:src="m.icons" alt="card" height="16">
                                </div>

                                <div class="col-auto">
                                    <div class="radio-button fz-2" v-bind:class="{'active' :order.method===m.id}"></div>
                                </div>
                            </div>
                        </div>
                    </template>


                                <div class="h-1 bg-black-10 my-3"></div>
                <div class="text-center mt-4">
                <template v-if="loading==false">
                    <div class="btn btn-blue" v-on:click="save()">
                        <span>Pay now</span>
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
            text:{
                name: "2. Select payment method",
                description: "We accept Visa, MasterCard, AmEx, PayPal, and PayLater."
            },
            

            methods: [
                {
                    id:1,
                    name:"Card payment",
                    text:"Payment will be processed in Indonesian Rupiah, with an additional 3% merchant fee.",
                    icons:"",
                    icon:"/themes/bluuu/assets/icons/card_icon.svg"
                },
                {
                    id:2,
                    name:"Paypal",
                    text:"Payment will be processed in your preferred currency, with an additional 5% merchant fee.",
                    icons:"",
                    icon:"/themes/bluuu/assets/icons/paypal_icon.svg"
                }
            ],
            loading: false
            
        }
    },
    computed: {
        selectedMethod() {
            return this.methods.find(m => m.id == this.order.method)
        }

    },
    methods:{
        save(){
            this.loading=true;
            this.$emit('save');
        }
    }
}
