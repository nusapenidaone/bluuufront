 const { createApp } = Vue;
    createApp({
        data() {
            return {
                loaded: true,
                redirect: false,
                current: null,
                rates,
                step: 1,
                edit_status,
                tour,
                order,
                oldOrder: JSON.parse(JSON.stringify(order))
            };
        },

        watch: {
            //'order.step': 'scrollTop',
            'order.travel_date': 'calculateTourPrice',
            'order.adults': 'calculateTourPrice',
            'order.kids': 'calculateTourPrice',
            'order.children': 'calculateTourPrice',
            'order.transfer_id': 'calculateTourPrice',
            'order.cover_id': 'calculateTourPrice',
            'order.discount': 'calculateTourPrice',
            'order.extras': {
                handler: 'calculateTourPrice',
                deep: true
            },
            'order.program_id': {
                handler() {
                    this.calculateTourPrice();
                    this.selectRestaurant();
                }
            }
        },

        mounted() {
        },
        computed: {

            hasChanges() {
                const fields = [
                    'travel_date',
                    'pickup_address',
                    'dropoff_address',
                    'adults',
                    'kids',
                    'children',
                    'transfer_id',
                    'cover_id',
                    'restaurant_id',
                    'program_id'
                ];

                // Сравнение простых полей
                for (const f of fields) {
                    if (this.order[f] !== this.oldOrder[f]) {
                        return true;
                    }
                }
                // Сравнение extras (массив)
                if (JSON.stringify(this.order.extras) !== JSON.stringify(this.oldOrder.extras)) {
                    return true;
                }
                return false; // если ничего не изменилось
            },
            selectedProgram(){
                if(!this.order.program_id) return null;
                return  this.tour.program?.find(p => p.id === this.order.program_id);
            },

            program() {
                if (!this.tour || !this.tour.program) return null
                return this.tour.program.find(item => item.id === this.order.program_id) || null
            },
            restaurant() {
                if (!this.tour || !this.selectedProgram.restaurant) return null
                return this.selectedProgram.restaurant.find(item => item.id === this.order.restaurant_id) || null
            },
            transfer() {
                if (!this.tour || !this.tour.transfer) return null
                return this.tour.transfer.find(item => item.id === this.order.transfer_id) || null
            },
            cover() {
                if (!this.tour || !this.tour.cover) return null
                return this.tour.cover.find(item => item.id === this.order.cover_id) || null
            },
            membersView(){
                const members=this.order.adults+this.order.kids+this.order.children;
                if(members>1){
                    return  members+ ' persons'
                }else{
                    return members + ' person'
                }
            },
        },
        methods:{
            cahngeOrder(){
                this.redirect=true
                axios.post('/api/order/update', this.order, {
                        headers: {
                            'X-CSRF-TOKEN': k
                        }
                    })
                .then(function (response) {
                    window.location.href = response.data;
                })
                .catch(function (error) {
                    window.location.href="https://bluuu.tours/booking/error"
                });
            },

            cancelOrder(){
                this.redirect=true
                axios.post('/api/order/cancel', {
                    id: this.order.id
                },
                {
                        headers: {
                            'X-CSRF-TOKEN': k
                        }
                    })
                .then(function (response) {
                    window.location.href = response.data;
                })
                .catch(function (error) {
                    window.location.href="https://bluuu.tours/booking/error"
                });
            },
            resetChanges(){
                Object.assign(this.order, JSON.parse(JSON.stringify(this.oldOrder)))
            },
            removeExtras(id){
                const index = this.order.extras.findIndex(item => item.id === id);
                if (index !== -1) {
                this.order.extras.splice(index, 1);
                }
            },
            selectRestaurant() {
                const restaurants = this.selectedProgram?.restaurant;
                this.order.restaurant_id =
                    Array.isArray(restaurants) && restaurants.length > 0
                        ? restaurants[0].id
                        : null;
            },
            showInfo(info) {
                this.info = info;
                setTimeout(() => {
                    this.info = null
                }, 1000);
            },

            //calculator
            calculateTourPrice() {
                const members = this.order.adults + this.order.kids + this.order.children;
                const allMembers = this.order.adults + this.order.kids + this.order.children;
                const numCars = Math.ceil(allMembers / 5);
                const date = new Date(this.order.travel_date);
                let boat_price = parseFloat(this.tour.boat_price || 0);
                let tour_price = 0;
                let program_price = 0;
                let transfer_price = 0
                let cover_price = 0;
                let extras_total = 0;
                let discount = this.order.discount;
                let discount_price = 0;

                // 1. Package
                let selectedPackage = this.tour.packages;

                if (Array.isArray(this.tour.pricesbydates)) {
                    // сначала фильтруем интервалы, которые включают date
                    const matchingIntervals = this.tour.pricesbydates.filter(p => {
                        const from = new Date(p.date_start);
                        const to = new Date(p.date_end);
                        return date >= from && date <= to;
                    });

                    // среди найденных выбираем тот, где low_price == true
                    const lowPriceInterval = matchingIntervals.find(p => p.low_price);
                    const flashSaleInterval = matchingIntervals.find(p => p.flash_sale);
                    if(flashSaleInterval){
                        selectedPackage = flashSaleInterval.packages;
                    }else if (lowPriceInterval) {
                        selectedPackage = lowPriceInterval.packages;
                    } else if (matchingIntervals.length > 0) {
                        // если нет интервала с low_price, берём первый попавшийся
                        selectedPackage = matchingIntervals[0].packages;
                    }
                }
                 
                

                // 2. Price
                const match = selectedPackage?.pricelist?.find(
                    i => i.members_count == members
                );
                if (match) {
                    tour_price = parseFloat(match.price);
                }

                // 6. Program
                if (this.order.program_id) {
                    const selectedProgram = this.tour.program?.find(
                        p => p.id === this.order.program_id
                    );
                    if (selectedProgram && !selectedProgram.included) {
                        program_price = parseFloat(selectedProgram.price * numCars);
                    }
                }
                
                // 3. Transfer
                if (this.order.transfer_id) {
                    const selectedTransfer = this.tour.transfer?.find(
                        t => t.id === this.order.transfer_id
                    );
                    transfer_price = selectedTransfer ?
                        selectedTransfer.price * numCars :
                        0;
                }
                
                // 4. Cover
                if (this.order.cover_id) {
                    const selectedCover = this.tour.cover?.find(
                        c => c.id === this.order.cover_id
                    );
                    if (selectedCover) {
                        if (selectedCover.per_boat) {
                            cover_price = selectedCover.price;
                        } else {
                            cover_price = selectedCover.price * members;
                        }
                    }
                }
                

                // 5. Extras
                if (Array.isArray(this.order.extras) && this.order.extras.length > 0) {
                    const extrasMap = {};
                    this.tour.ecategories?.forEach(cat => {
                        cat.extras.forEach(e => {
                            extrasMap[e.id] = e;
                        });
                    });

                    for (const ex of this.order.extras) {
                        const item = extrasMap[ex.id];
                        if (item) {
                            extras_total += parseFloat(item.price) * ex.qty;
                        }
                    }
                }


                if (discount > 0) {
                    discount_price = tour_price * discount / 100
                }

                // Total
                this.order.members = members;
                this.order.allMembers = allMembers;
                this.order.cars = numCars;
                this.order.boat_price = boat_price;
                this.order.tour_price = tour_price;
                this.order.transfer_price = transfer_price;
                this.order.cover_price = cover_price;
                this.order.program_price = program_price;
                this.order.extras_total = extras_total;
                this.order.discount_price = discount_price;
                this.order.full_price = boat_price + tour_price + transfer_price + cover_price + extras_total + program_price;
                this.order.total_price = boat_price + tour_price + transfer_price + cover_price + extras_total + program_price - discount_price;


            },
        }
    })
    .component('currency-selector', CurrencySelector)
    .component('promo-code', PromoCode)
    .component('slider', ImageSlider)
    .component('format-number', FormatNumber)
    .component('format-date', FormatDate)
    .component('boat-slider', BoatSlider)
    .component('param-selector', ParamSelector)
    .component('program-selector', ProgramSelector)
    .component('transfer-selector', TransferSelector)
    .component('cover-selector', CoverSelector)
    .component('extras-selector', ExtrasSelector)
    .component('restaurant-selector', RestaurantSelector)
    .component('method-selector', MethodSelector)
    .provide('order', order)
    .mount("#app");