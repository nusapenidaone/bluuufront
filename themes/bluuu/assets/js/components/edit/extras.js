const ExtrasSelector = {


  props: {
    ecategories: {
      type: Array,
      required: true
    },
    show: {
      type: Boolean,
      default: false
    }
  },

    inject: ['order'],
    template: `
        <div class="p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 cursor" v-on:click="open=!open">
                <div class=" fw-600 flex-grow-1">Add extras</div>
                <div class="open-icon" v-bind:class="{ active : open==false }"></div>
            </div>
            <Transition>
                <template v-if="open">
                    <div class="mt-4">
                        <div class="h-1 bg-black-10 my-3"></div>

                        <div class="d-flex flex-nowrap w-100 ox-auto gx-3 custom-scroll">
                            <div 
                                class="px-3 py-2 rounded me-2 rounded-3 text-nowrap pointer border-black-10" 
                                v-bind:class="{'border-blue': current == category.id,'border-black-10': current != category.id}"
                                v-for="category in ecategories" 
                                v-bind:key="category.id"
                                v-on:click="current = category.id">
                                {{ category.name }}
                            </div>
                        </div>
                       <TransitionGroup tag="div">
                        <div v-for="extras in selectedCategory.extras" v-bind:key="extras.id" v-on:click="showExtras(extras)" class="pointer">
                            <div class="h-1 bg-black-10 my-3"></div>
                            <div class="row gx-xl-4 gx-3">
                                <div class="col-xl-2 col-3">
                                    <img v-bind:src="extras.images_with_thumbs[0]?.thumb" alt="img" class="w-100 ratio-1x1 rounded-1 img">
                                </div>
                                <div class="col-xl-10 col-9">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="d-flex align-items-center">
                                            <div class="fw-600 me-2 flex-grow-1">
                                                <span v-text="extras.name"></span>
                                            </div>
                                        </div>
                                        <div class="fz-09 c-500 mt-2 truncate-2" v-html="extras.description"></div>
                                        <div class="flex-grow-1 mt-2"></div>

                                        <div class="row align-items-center">
                                            <div class="col">
                                                <div class="fw-600 c-950 "><format-number v-bind:number="extras.price" /></div>
                                            </div>
                                            <div class="col-auto d-flex align-items-center">
                                                <button class="btn btn-dark btn-sm" >Add</button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                              
                            </div>
                        </div>
                        </TransitionGroup>
                    </div>
                </template>
            </Transition>

            <Teleport to="body">
                <template>
                    <div class="popup-large bg-white p-4 rounded-15 flex-xl-grow-0 flex-grow-1 rounded-md-0" id="extras-popup" v-if="extras" :key="extras.id">
                        <div class="row">
                            <div class="col-xl-4">
                                 <div class="rounded-1 oh">
                                    <slider v-bind:images="extras.images_with_thumbs" :key="extras.id"></slider>
                                 </div>
                            </div>
                            <div class="col-xl-8 mt-4 content">
                                <div class="fw-600 fz-15 c-950" v-text="extras.name"></div>
                                <div class="c-500 mt-3" v-html="extras.description"></div>
                                <div class="row gx-2">
                                    <div class="col mt-4">
                                        <div class="fw-600 c-950 fz-12 "><format-number v-bind:number="extras.price" /></div>
                                    </div>
                                    <div class="col-auto mt-4">
                                        <div class="counter fz-1 d-flex align-items-center" v-if="!extras.by_request">
                                            <div class="counter-button counter-minus" v-on:click="decreaseQty(extras)" v-bind:class="{ disabled: extras.localQty<=0 }"></div>
                                            <div class="counter-value px-2">{{ extras.localQty || 0 }}</div>
                                            <div class="counter-button counter-plus" v-on:click="increaseQty(extras)" v-bind:class="{ disabled: !availableQty(extras) }"></div>
                                        </div>
                                    </div>
                                    <div class="col-auto mt-4">
                                        <button v-if="extras.localQty>0" class="btn btn-blue btn-sm ms-2 py-2 px-3" v-on:click="confirmAdd(extras)" data-fancybox-close>Add to card</button>
                                        <button v-else class="btn btn-light btn-sm ms-2 py-2 px-3" disabled>Add to cart</button>
                                    </div>
                                </div>
                            </div>
                            <template v-if="extras.details">
                            <div class="col-12 mt-4 content">
                            <div class="h-1 bg-black-10"></div>
                            </div>
                            <div class="col-xl-12 mt-4 content">
                                <div class="c-blue fw-600 fz-12">Details</div>
                                <div class="mt-3  c-500" v-html="extras.details"></div>
                            </div>
                            </template>
                        </div>
                    </div>
                </template>
            </Teleport>
        </div>
    `,
    data() {
        return {
            open: this.show,
            current: this.ecategories?.[0]?.id || null,
            extras: null,
        }
    },
    computed: {
        selectedCategory() {
            return this.ecategories.find((category) => category.id == this.current) || {}
        },
    },

    methods: {
        showExtras(extras){

            extras.localQty=0;
            this.extras = extras;
            Fancybox.show([{
                src: "#extras-popup",
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

            availableQty(extras){
                const item = this.order.extras.find(e => e.id === extras.id);
                const alreadyInCart = item ? item.qty : 0;
                if(extras.available-alreadyInCart>0){
                    return true
                }else{
                    return false
                }
            },

        increaseQty(extra) {
            
            const item = this.order.extras.find(e => e.id === extra.id);
            const alreadyInCart = item ? item.qty : 0;
            if (extra.localQty + alreadyInCart < extra.available) {
                extra.localQty++;
            }
        },

        decreaseQty(extra) {
            if (extra.localQty > 0) {
                extra.localQty--;
            }
        },

        confirmAdd(extra) {
           
            let item = this.order.extras.find(e => e.id === extra.id);
            if (item) {
                const newQty = Math.min(item.qty + extra.localQty, extra.available);
                extra.localQty = newQty - item.qty;
                item.qty = newQty;
            } else {
                this.order.extras.push({
                    id: extra.id,
                    name: extra.name,
                    qty: Math.min(extra.localQty, extra.available),
                    price: extra.price
                });
            }
            this.$emit('close', extra.name + " added to a Tour");
            extra.localQty = 0;
        }
    },
}
