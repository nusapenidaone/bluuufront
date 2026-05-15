
const TransferSelector={
    props: ['transfers'],
    inject: ['order'],

    template:`

        <div class="p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer" v-on:click="show=!show">
                <div class=" fw-600 flex-grow-1">Add transfer</div>
                <div class="open-icon" v-bind:class="{ active : show==false }"></div>
            </div>
            <Transition>
                <template v-if="show">
                    <div class="mt-4">
                        <div v-for="transfer in transfers" v-bind:key="transfer.id" class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3" v-on:click="save(transfer)">
                                <div class="col-xl-2 col-3">
                                    <img v-if="transfer.id==3" src="/themes/bluuu/assets/img/bus.webp" alt="" class="w-100 ratio-1x1 rounded-1 img">
                                    <img v-else src="/themes/bluuu/assets/img/transfer.webp" alt="" class="w-100 ratio-1x1 rounded-1 img">
                                    
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex">
                                            <div class="fw-600 me-2 flex-grow-1">
                                                <span class="text-nowrap me-2">
                                                    {{transfer.name}}
                                                </span>
                                                <br class="d-xl-none">
                                                <span class="text-nowrap c-blue">
                                                    (<format-number v-bind:number="transfer.price*this.order.cars" />)
                                                </span>
                                            </div>
                                            <div class="radio-button fz-15" v-bind:class="{ active : order.selectedTransferId==transfer.id }"></div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 pe-xl-5" v-html="transfer.short_description"></div>
                                        <div v-if="transfer.id!=3" class="mt-2"><span class="fz-09 tdu c-950 tdu" v-on:click.stop="showTransfer(transfer)">How it works</span></div>
                                    </div>
                                </div>
                            </div>


                        <div v-if="transfer.id==1 && order.selectedTransferId==1">
                            
                            <div class="mt-3">
                                <div class="mb-2 c-500 fz-09">Pick Up Address</div>
                                <input class="input" type="text" v-model="order.pickupAddress" placeholder="Enter Pick Up Address">
                            </div>
                        </div>
                        <div v-if="transfer.id==2 && order.selectedTransferId==2">
                            
                            <div class="mt-3">
                                <div class="mb-2 c-500 fz-09">Pick Up Address</div>
                                <input class="input" type="text" v-model="order.pickupAddress" placeholder="Enter Pick Up Address">
                            </div>
                            <div class="mt-3">
                                <div class="mb-2 c-500 fz-09">Drop Off Address</div>
                                <input class="input mb-3" type="text" v-model="order.dropoffAddress" placeholder="Enter Drop Off Address" v-if="same==false">
                                <div class="d-flex align-items-center pointer" v-on:click="same=!same">
                                    <div class="checkbox-button fz-15" v-bind:class="same ? 'active': ''"></div>
                                    <span class="ms-2 c-500">Same address for pick up and drop off</span>
                                </div>
                            </div>
                        </div>


                        </div>
                        <div class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3" v-on:click="save(null)">
                                <div class="col-xl-2 col-3">
                                    <img src="/themes/bluuu/assets/img/no-transfer.webp" alt="" class="w-100 ratio-1x1 rounded-1 img">
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex align-items-center">
                                            <div class="fw-600 me-2 flex-grow-1">No transfer</div>
                                            <div class="radio-button fz-15" v-bind:class="{ active : order.selectedTransferId==null }"></div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 pe-xl-5" v-html="popupText[2]"></div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>

                    </div>
                </template>
            </Transition>

            <Teleport to="body">
                <template >

                    <div id="transfer-popup" class="popup-large bg-white p-4 content rounded-15 flex-xl-grow-0 flex-grow-1 rounded-md-0" v-if="transfer">

                        <div class="fz-15 c-950 fw-600 text-center">Transfer</div>
                        <div class="c-500 fz-09 text-center mt-2">We recommend booking our private transportation services <br>
                            for a smooth boarding process and timely arrival.</div>

                        <div class="row gx-3 mt-3">
                            <div class="col-xl-6 mt-3">
                                <div class="border-black-10 h-100 p-4 rounded-1 d-flex flex-column align-items-start">
                                    <div class="bg-blue-10 c-blue rounded-3 px-3 py-2 lh-1 fw-600">Pickup Areas</div>
                                    <div class="mt-4 flex-grow-1"></div>
                                    <div v-html="popupText[0]"></div>
                                </div>
                            </div>
                            <div class="col-xl-6 mt-3">
                                <div class="border-black-10 h-100 p-4 rounded-1 d-flex flex-column align-items-start">
                                    <div class="bg-blue-10 c-blue rounded-3 px-3 py-2 lh-1 fw-600">Cost</div>
                                    <div class="mt-4 flex-grow-1"></div>
                                    <div v-html="popupText[1]"></div>
                                </div>
                            </div>
                            <div class="col-xl-6 mt-3">
                                <div class="border-black-10 h-100 p-4 rounded-1 d-flex flex-column align-items-start">
                                    <div class="bg-blue-10 c-blue rounded-3 px-3 py-2 lh-1 fw-600">Cars</div>
                                    <div class="mt-4 flex-grow-1"></div>
                                    <div>We use Toyota Avanza / Suzuki <br>APV vehicles for transfers.</div>
                                </div>
                            </div>
                            <div class="col-xl-6 mt-3">
                                <div class="border-black-10 h-100 p-4 rounded-1 d-flex flex-column align-items-start">

                                    <div class=" bg-orange-50 c-orange rounded-3 px-3 py-2 lh-1 fw-600">Attention</div>
                                    <div class="mt-4 flex-grow-1"></div>
                                    <div>Non-refundable once <br>the service has been used.</div>
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
            popupText:[
                "Canggu, Kuta, Sanur, Uluwatu, Nusa Dua, Jimbaran, Sanur, Seminyak, Kerobokan, Ubud, Legian, Denpasar, Gianyar, and Pererenan.",
                "The price is calculated for your group (one car accommodates five adults: 1-5 people = 1 car, 6-11 people = 2 cars, and so on).",
                "If you come on your own, you can take an online taxi (Go-Jek or Grab) to Serangan in the morning. But for the return, online taxis are not allowed by local government. You’ll need a local taxi, which is very expensive. It’s best to book your return transfer in advance with us!"
            ],
            show: false,
            active: this.order.selectedTransferId,
            same: false,
            pickupAddress: this.order.pickupAddress,
            dropoffAddress: this.order.dropoffAddress,
            select: null,
            transfer: null,
        };
    },

    methods: {
        checkSame(){
            if(this.same) {
                this.order.dropoffAddress=this.order.pickupAddress
            }
        },

        showTransfer(transfer){

            this.transfer= transfer;
            Fancybox.show([{
                src: "#transfer-popup",
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
        save(transfer) {
           
            
            if(transfer==null){

                this.order.selectedTransferId=null;
                this.active=null;
                this.$emit('close', ' Transfer removed');
            }else{

                if(transfer.id==this.order.selectedTransferId) return false;
                this.order.selectedTransferId=transfer.id;
                this.active=transfer.id;
                this.$emit('close', transfer.name + ' applied' );
            }

        }
    },
}