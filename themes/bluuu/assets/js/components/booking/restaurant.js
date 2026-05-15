
const RestaurantSelector= {
    props: ['restaurants'],
    inject: ['order'],
    template: `

        <div class="p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer" v-on:click="show=!show">
                <div class=" fw-600 flex-grow-1">
                <span v-if="restaurants.length>1">Select Restaurant</span>
                <span v-else>Restaurant</span>
                </div>
                <div class="open-icon" v-bind:class="{ active : show==false }"></div>
            </div>
            <Transition>
                <template v-if="show">
                    <div class="mt-4">
                        <div v-for="restaurant in restaurants" v-bind:key="restaurant.id" class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3" v-on:click="save(restaurant)">
                                <div class="col-xl-2 col-3">
                                    <img v-bind:src="restaurant.images_with_thumbs[0]?.thumb" alt="img" class="w-100 ratio-1x1 rounded-1 img">
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex align-items-center">
                                            <div class="fw-600 me-2 flex-grow-1">
                                                <span v-text="restaurant.name"></span><span v-if="restaurant.included" class="px-2 ms-2 fz-09 bg-blue-50 c-blue rounded-3">included</span>
                                            </div>
                                            <div v-if="restaurants.length>1" class="radio-button fz-15" v-bind:class="{ active : order.selectedRestaurantId==restaurant.id }"></div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 pe-xl-5" v-html="restaurant.description"></div>
                                        <div class="flex-grow-1 mt-2"></div>
                                        <div><span class="fz-09 tdu c-950 tdu" v-on:click.stop="showRestaurant(restaurant)">Show Menu</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Transition>


            <Teleport to="body">
                <template>
                    <div class="popup-large bg-white p-4 rounded-15 flex-xl-grow-0 flex-grow-1 rounded-md-0" id="restaurant-popup" v-if="restaurant">
                    
                        <div class="row align-items-center">
                            <div class="col-xl-4">
                                  <div class="rounded-1 oh">
                                    <slider v-bind:images="restaurant.images_with_thumbs" :key="restaurant.id"></slider>
                                 </div>
                            </div>
                            <div class="col-xl-8 mt-4 content">
                                <div class="fw-600 fz-15 c-950" v-text="restaurant.name"></div>
                                <div class="c-500 mt-3 pe-xl-4" v-html="restaurant.description"></div>
                                
                            </div>
                            <div class="col-12 mt-4 content">
                            <div class="h-1 bg-black-10"></div>
                            </div>
                            <div class="col-xl-12 mt-4">
                                <div class="d-inline-block bg-blue-10 c-blue rounded-3 px-3 py-2 lh-1 fw-600">MENU</div>
                               
                                <div class="mt-3  c-500" v-html="restaurant.menu"></div>
                               
                            </div>
                           
                        </div>
                    </div>
                </template>
            </Teleport>
        </div>
    `,
    data(){
        return{
            restaurant: null,
            show: false,
            active: this.order.selectedRestaurantId,
        }
    },
    methods:{
        showRestaurant(restaurant){

            this.restaurant= restaurant;
            Fancybox.show([{
                src: "#restaurant-popup",
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
        save(restaurant){
            if(restaurant.id==this.order.selectedRestaurantId) return false;
            this.order.selectedRestaurantId=restaurant.id;
            this.$emit('close',restaurant.name + " applied");
        }
    },
}

