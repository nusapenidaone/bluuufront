const DepositeSelector={
    inject: ['order'],
    template:`
        <div class="p-xl-1 p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer">
                <div class="fw-600 flex-grow-1">
                    <span>{{text.name}}</span>
                    <div></div>
                </div>
                <div v-if="order.payStep>1">
                    <div class="fz-09 c-950 fw-600 tdu c-blue-hover" v-on:click="order.payStep=1">Edit</div>
                </div>
            </div>
            <div class="fz-09 c-500">{{text.description}}</div>
            <Transition>
                <div>
                    <template v-if="order.payStep==1">
                        <div class="h-1 bg-black-10 my-3"></div>
                        <div class="c-950 pointer" v-on:click="deposite=100">
                            <div class="row justify-content-end gx-3 align-items-center">
                                <div class="col">
                                    <div class="fw-600">
                                        Pay Now
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <div class="px-3 py-2 rounded-3 lh-1 fw-600 bg-blue-10">
                                        <format-number v-bind:number="order.totalPrice" />
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <div class="radio-button fz-2" v-bind:class="{'active' :deposite===100}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="h-1 bg-black-10 my-3"></div>
                        <div class="c-950 pointer" v-on:click="deposite=50">
                            <div class="row justify-content-end gx-3 align-items-center">
                                <div class="col">
                                    <div class="fw-600">
                                        Pay part now, part later
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <div class="px-3 py-2 rounded-3 lh-1 fw-600 bg-blue-10">
                                        <format-number v-bind:number="order.totalPrice/2" />
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <div class="radio-button fz-2" v-bind:class="{'active' :deposite===50}"></div>
                                </div>
                                <div class="col-12 mt-xl-0 mt-2">
                                    <div class="fz-09 c-500">
                                        <span><format-number v-bind:number="order.totalPrice/2" ></format-number></span>&nbsp;due today,&nbsp;<span>
                                        <format-number v-bind:number="order.totalPrice/2" ></format-number></span>&nbsp;on&nbsp; <span><prev-date v-bind:date="order.travelDate" ></prev-date></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="h-1 bg-black-10 my-3"></div>
                        <div class="row flex-row-reverse">
                            <div class="col-auto">
                                <div class="btn btn-dark" v-on:click="save()">Done</div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="h-1 bg-black-10 my-3"></div>
                        <div class="fw-600" v-if="deposite==100">Full payment</div>
                        <div class="fw-600" v-else-if="deposite==50">Deposit 50%</div>
                    </template>
                </div>
            </Transition>
        </div>
    `,
    data(){
        return{
            text: {
                name: "1. Choose to pay",
                description: "Pay now or pay 50% later"
            },
            deposite: order.deposite
        }
    },
    methods:{
        save(){
            this.order.deposite=this.deposite;
            this.order.payStep=2;
        }
    }

}
