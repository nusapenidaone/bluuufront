const MethodSelector ={
    
    inject: ['order'],
    template:`
        <div class="p-xl-1 p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer">
                <div class="fw-600 flex-grow-1">
                    <span>{{text.name}}</span>
                </div>
                <div >
                    <div class="fz-09 c-950 fw-600 tdu c-blue-hover" >Edit</div>
                </div>
            </div>
            <div class="fz-09 c-500">{{text.description}}</div>
            <Transition>
                <div >
                    <template v-for="m in methods">
                        <div class="h-1 bg-black-10 my-3"></div>
                        <div class="c-950 pointer" v-on:click="method=m.id">
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
                                    <div class="radio-button fz-2" v-bind:class="{'active' :method===m.id}"></div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div class="h-1 bg-black-10 my-3"></div>
                    <div class="row flex-row-reverse">
                        <div class="col-auto">
                            <div class="btn btn-dark " v-on:click="save">Done</div>
                        </div>
                    </div>
                </div>

            </Transition>
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
            method: order.method_id
        }
    },
    computed: {
        selectedMethod() {
            return this.methods.find(m => m.id == this.method)
        }

    },
    methods:{
        save(){
            this.order.method=this.method;
            this.order.payStep=3;
        }
    }
}
