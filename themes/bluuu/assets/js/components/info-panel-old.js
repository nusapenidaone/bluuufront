const InfoPanel={
    props: ['tour'],
    inject: ['order'],
    template:`
   <div class="bg-white rounded-1 shadow p-4" id="check" style="scroll-margin-top: 6rem">
    <template v-if="order.step>1">
        <div class="row align-items-center">
            <div class="col-5">
                <img v-bind:src="tour.images_with_thumbs[0].thumb1" class="w-100 rounded-1 ratio-3x2">
            </div>
            <div class="col-7 fw-600">
                <div class="fz-12">{{tour.name}}</div>
                <div class="fz-09 d-flex align-items-center"> <i class="star-icon me-2"></i> 4.9</div>
            </div>
        </div>
        <div class="pt-3 border-dashed-bottom"></div>
    </template>
    <template v-if="order.travelDate">
        <div class="py-3 border-dashed-bottom" data-fancybox data-src="#params" data-close-button="false">
            <div class="d-flex align-items-center pointer" >
                <div class="flex-grow-1 c-950 fw-600">Date</div>
                <div>
                    <format-date v-bind:date="order.travelDate" />
                </div>
                <i class="edit-icon ms-2"></i>
            </div>
            <div class="mt-2 d-flex align-items-center pointer">
                <div class="flex-grow-1 c-950 fw-600 ">Passengers</div>
                <div>{{order.allMembers}}&nbsp;person</div>
                <i class="edit-icon ms-2"></i>
            </div>
        </div>
        <div class="py-3 border-dashed-bottom" v-if="!tour.partner">
            <div class="d-flex align-items-center fw-600" v-if="order.promocode">
                <i class="promocode-icon fz-2"></i>
                <div class="ms-2 flex-grow-1 c-950">Promo code&nbsp; ({{order.promocode}})&nbsp; activated!</div>
            </div>
            <div class="d-flex rounded-1 bg-100 align-items-center" v-if="!order.promocode">
                <input class="input" type="text" v-model="promocode" placeholder="Enter your promo code" v-bind:disabled="loading" />
                <div class="btn btn-dark" v-bind:class="{ disabled: loading }" v-on:click="checkPromo">
                    {{ loading ? 'Checking…' : 'Activate' }}
                </div>
            </div>
            <div class="c-red fz-08 mt-2" v-if="error">{{ error }}</div>
        </div>
        <template v-if="order.discount > 0">
            <div class="py-3 border-dashed-bottom">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1 c-950 fw-600">Tour price</div>
                    <div>
                        <format-number v-bind:number="order.fullPrice" />
                    </div>
                </div>
                <div class="mt-2 d-flex align-items-center">
                    <div class="flex-grow-1 c-950 fw-600">Discount&nbsp;{{order.discount}}%</div>
                    <div class="c-green">
                        -
                        <format-number v-bind:number="order.discountPrice" />
                    </div>
                </div>
            </div>
        </template>
        <div class="py-3 d-flex">
            <div class="flex-grow-1">
                <div class="c-950 fw-600">Total</div>
                <template v-if="order.step>1">
                <div class="tdu c-500 fz-09 pointer" data-fancybox data-src="#booking-details">Edit booking cart</div>
                <div class="tdu c-500 fz-09 pointer" data-fancybox data-src="#more">Booking details</div>
                </template>
            </div>
            <div class="fw-600">
                <format-number v-bind:number="order.totalPrice" />
            </div>
        </div>
        <div class="btn btn-orange w-100 mt-3" v-on:click="order.step=2" v-if="order.step==1">
            <span>Book Now</span>
        </div>
        <div class="btn btn-orange w-100 mt-3" v-on:click="order.step=3" v-else-if="order.step==2">
            <span v-if="tour.partner">Send Request</span>
            <span v-else>Proceed to payment</span>
        </div>
    </template>
    <template v-else>
        <div class="py-3 d-flex border-dashed-bottom align-items-center">
            <div class="flex-grow-1">
            <div class="c-950 fw-600">from</div>
            <div class="c-500">varies by group size</div>
            </div>
            <div class="fz-12 fw-600">
                <format-number v-bind:number="tour.packages.pricelist[0].price" />
            </div>
        </div>
        <div class="btn btn-orange w-100 mt-3" data-fancybox data-src="#params" data-close-button="false">
            <span>Check availability</span>
        </div>
    </template>
</div>
<Teleport to="body">
    <div class="d-xl-none d-block sticky-footer  z-3 bg-white shadow py-3" v-if="order.step!=3">

        <div class="container-xl">
            <div class="row align-items-center">
                <template v-if="order.travelDate">
                    <div class="col" data-src="#booking-details" data-fancybox>
                        <div class="fz-12 fw-600 c-950 tdu">
                            <format-number v-bind:number="order.totalPrice" />
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="c-500"><span>
                                    <format-date v-bind:date="order.travelDate" />
                                </span>&nbsp; (<span v-text="order.allMembers"></span> &nbsp;person)
                            </div>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="btn btn-orange w-100" v-if="order.step==1" v-on:click="order.step=2">
                            <span>Book Now</span>
                        </div>
                        <div class="btn btn-orange w-100" v-else-if="order.step==2" v-on:click="order.step=3">
                            <span v-if="tour.partner">Send Request</span>
                            <span v-else>Proceed to payment</span>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="col">
                        <div class="c-500">from </div>
                        <span class="fz-12 fw-600 c-950">
                            <format-number v-bind:number="tour.packages.pricelist[0].price" />
                        </span>
                    </div>
                    <div class="col-auto">
                        <div class="btn btn-orange w-100" data-fancybox data-src="#params" data-close-button="false">
                            <span>Check Availability</span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
    <template>
        <div class="bottom-popup bg-white popup-medium p-xl-1 p-4 order-lg-0 order-1 rounded-1" id="booking-details">
            <div class="fw-600 c-950 fz-12 border-dashed-bottom pb-3">Booking cart</div>
            
            <div class="border-dashed-bottom py-3">
                <div class="d-flex align-items-center pointer" data-fancybox data-src="#params" data-close-button="false">
                    <div class="flex-grow-1 fw-600 c-950">Date</div>
                    <div>
                        <format-date v-bind:date="order.travelDate" />
                    </div>
                    <i class="edit-icon ms-2"></i>
                </div>
                <div class="mt-2 d-flex align-items-center pointer" data-fancybox data-src="#params" data-close-button="false">
                    <div class="flex-grow-1 fw-600 c-950">Passengers</div>
                    <div>
                        <span v-text="order.allMembers"></span>&nbsp;person
                    </div>
                    <i class="edit-icon ms-2"></i>
                </div>
            </div>
            <div class="py-3 border-dashed-bottom c-500">
                <div class="fw-600 c-950">Tour</div>
                <div class="mt-2 d-flex align-items-center">
                    <div class="flex-grow-1">{{tour.name}}</div>
                    <span>
                        <format-number v-bind:number="order.boatPrice+order.tourPrice" />
                    </span>
                </div>
                <div class="mt-2 d-flex align-items-center" v-if="order.discount > 0">
                    <div>Discount&nbsp;<span v-text="order.discount+'%'"></span></div>
                    <div class="flex-grow-1"></div>
                    <div class="c-green">-
                        <format-number v-bind:number="order.discountPrice" />
                    </div>
                </div>
                <div class="mt-2 d-flex align-items-center">
                    <div>{{selectedProgram.name}}</div>
                    <div class="flex-grow-1"></div>
                    <span v-if="order.programPrice==0">Included</span>
                    <format-number v-else v-bind:number="order.programPrice"></format-number>
                </div>
                <div class="mt-2 d-flex align-items-center">
                    <div>{{selectedRestaurant.name}}</div>
                    <div class="flex-grow-1"></div>
                    <span>Included</span>
                </div>
                <div class="mt-2 d-flex align-items-center" v-if="selectedTransfer">
                    <div>{{selectedTransfer.name}}</div>
                    <i class="ms-2 remove-icon pointer" v-on:click="order.selectedTransferId=null"></i>
                    <div class="flex-grow-1"></div>
                    <format-number v-bind:number="order.transferPrice" />
                </div>
                <div class="mt-2 d-flex align-items-center" v-if="selectedCover">
                    <div>{{selectedCover.name}}</div>
                    <i class="ms-2 remove-icon pointer" v-on:click="order.selectedCoverId=null"></i>
                    <div class="flex-grow-1"></div>
                    <format-number v-bind:number="order.coverPrice" />
                </div>
                <template v-if="order.selectedExtras.length">
                    <div class="mt-2 d-flex align-items-center" v-for="extras in order.selectedExtras">
                        <div>{{extras.name}} x {{extras.qty}}</div>
                        <i class="ms-2 remove-icon pointer" v-on:click="removeExtras(extras.id)"></i>
                        <div class="flex-grow-1"></div>
                        <format-number v-bind:number="extras.qty*extras.price" />
                    </div>
                </template>
            </div>
            <div class="pt-3 d-flex align-items-center fw-600 c-950 fz-12">
                <div class="flex-grow-1">
                    <div>Total</div>
                </div>
                <div>
                    <format-number v-bind:number="order.totalPrice" />
                </div>
            </div>
            <ul class="fz-08 c-500 border-dashed-bottom py-3">
                <li class="d-flex">
                    <span class="flex-grow-1 me-1">Tour Price</span><span class="text-nowrap">
                        <format-number v-bind:number="order.totalPrice*0.88-175000-35000*order.members" />
                    </span>
                </li>
                <li class="d-flex">
                    <span class="flex-grow-1 me-1">Sales Tax</span><span class="text-nowrap">
                        <format-number v-bind:number="order.totalPrice*0.12" />
                    </span>
                </li>
                <li class="d-flex">
                    <span class="flex-grow-1 me-1">Serangan Harbor Fee</span><span class="text-nowrap">
                        <format-number v-bind:number="75000+10000*order.members" />
                    </span>
                </li>
                <li class="d-flex">
                    <span class="flex-grow-1 me-1">Nusa Penida Harbor and Marine Park Fee</span><span class="text-nowrap">
                        <format-number v-bind:number="100000+25000*order.members" />
                    </span>
                </li>
            </ul>

            <div class="text-center fw-600 c-950 tdu mt-3 pointer" data-fancybox data-src="#more">More details</div>
 
        </div>
    </template>


    <template>

            <div class="bottom-popup bg-white popup-large p-xl-1 p-4 rounded-1" id="more">
                <div class="fw-600 c-950 fz-12 border-dashed-bottom pb-3">Booking details</div>
                <div class="border-dashed-bottom py-3">
    
               
                <div class="d-flex align-items-center">
                    <img src="/themes/bluuu/assets/icons/schedule-icon.svg" class="wh-1">
                    <div class="ms-2 fw-600 c-950">{{selectedProgram.name}}</div>
                </div>
                
                 <template v-for="(l, index) in selectedProgram.list" :key="index">
                        <div class="mt-2 fz-09">
                            <span class="c-950 fw-600">{{l.time}}&nbsp;({{l.duration}})</span>
                            <div class="c-500" v-html="l.title"></div>
                        </div>
                 </template>
                </div>
                <div class="border-dashed-bottom py-3">
                   
                    <div class="d-flex align-items-center">
                        <img src="/themes/bluuu/assets/icons/restaurant-icon.svg" class="wh-1">
                        <div class="ms-2 fw-600 c-950">{{selectedRestaurant.name}}</div>
                    </div>


                    <div class="fz-09 mt-2 c-500" v-html="selectedRestaurant.description"></div>
                </div>
                <div class="border-dashed-bottom py-3">
                    <div class="d-flex align-items-center">
                        <img src="/themes/bluuu/assets/icons/transfer-icon.svg" class="wh-1">
                        <div class="ms-2 fw-600 c-950">Meeting and pick up</div>
                    </div>

                    <div class="fz-09 mt-2 c-500 content" v-html="tour.meeting.text"></div>
                </div>
                <div class="border-dashed-bottom py-3">

                    <div class="d-flex align-items-center">
                        <img src="/themes/bluuu/assets/icons/included-icon.svg" class="wh-1">
                        <div class="ms-2 fw-600 c-950">Includes</div>
                    </div>


                    <div class="row g-2 mt-2">
                    <template v-for="(item, index) in tour.includes" :key="index">
                        <div class="col-auto">
                            <div class="px-3 py-2 rounded-3 bg-100 fz-09 c-950">
                                {{item.name}}
                            </div>
                        </div>
                    </template>
                    </div>
                </div>
                <div class="border-dashed-bottom py-3">

                    <div class="d-flex align-items-center">
                        <img src="/themes/bluuu/assets/icons/additional-icon.svg" class="wh-1">
                        <div class="ms-2 fw-600 c-950">Additional info</div>
                    </div>

                    <div class="fz-09 mt-2 c-500 content" v-html="tour.additional.text"></div>
                </div>
                <div class="pt-3">
                    <div class="d-flex align-items-center">
                        <img src="/themes/bluuu/assets/icons/cancelation-icon.svg" class="wh-1">
                        <div class="ms-2 fw-600 c-950">Cancelation</div>
                    </div>

                    <div class="fz-09 mt-2 c-500 content" v-html="tour.cancelation.text"></div>
                </div>
            </div>
    </template>
</Teleport>

    
    `,
    data(){
        return{
            
            promocode: '',
            loading: false,
            error: '',
            success: null,
            more: false,
            bookingInfo: 1,
        }
    },
    methods:{


        async checkPromo() {
            this.error = '';
            this.success = null;
            
            const trimmedCode = this.promocode.trim();

            if (!/^[a-zA-Z0-9]{4,}$/.test(trimmedCode)) {
                this.error = 'Please enter a valid promo code (min 4 alphanumeric characters).';
                return;
            }

            this.loading = true;

            try {
                const response = await axios.get('/api/checkpromo/'+trimmedCode);

                if (!response.data || !response.data.code) {
                    throw new Error('Invalid promo code.');
                }

                this.order.promocode = response.data.code;
                this.order.discount = response.data.discount;
                this.order.agent_fee = response.data.agent_fee;
                this.order.agent_name = response.data.agent_name;
                this.success =true;
            } catch (err) {
                this.order.promocode = null;
                this.order.discount = null;
                this.order.agent_fee = null;
                this.order.agent_name = null;
                this.error = 'Promo code not found or invalid.';
            } finally {
                this.loading = false;
            }
        },



        removeExtras(id){
            const index = this.order.selectedExtras.findIndex(item => item.id === id);
            if (index !== -1) {
              this.order.selectedExtras.splice(index, 1);
            }
        },
    },
    computed:{

        selectedProgram(){
            if(!this.order.selectedProgramId) return null;
            return  this.tour.program?.find(p => p.id === this.order.selectedProgramId);
        },
        selectedRestaurant(){
            if(!this.order.selectedRestaurantId) return null;
            return  this.tour.restaurant?.find(r => r.id === this.order.selectedRestaurantId);
        },
        selectedTransfer(){
            if(!this.order.selectedTransferId) return null;
            return  this.tour.transfer?.find(t => t.id === this.order.selectedTransferId);
        },
        selectedCover(){
            if(!this.order.selectedCoverId) return null;
            return  this.tour.cover?.find(t => t.id === this.order.selectedCoverId);
        },


    }
}