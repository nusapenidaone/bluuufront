const order = Vue.reactive({
    GaId: null,
    leadId,
    tourId: tour.id,
    travelDate:tour.current,
    adults: tour.adults,
    kids: tour.kids,
    children: tour.children,
    members: tour.adults,
    allMembers: tour.adults,
    selectedTransferId: transfer,
    selectedCoverId: cover,
    selectedProgramId: program,
    selectedRestaurantId: restaurant,
    step: tour.step,
    payStep: 1,
    language: 'EN',
    currency: 'IDR',
    rate: 1,
    deposite: 100,
    method: 1,
    flash_sale: false,
    cars: 1,
    selectedExtras: [],
    boatPrice: 0,
    tourPrice: 0,
    transferPrice: 0,
    coverPrice: 0,
    programPrice: 0,
    extrasTotal: 0,
    fullPrice: 0,
    discountPrice: 0,
    totalPrice: 0,
    pickupAddress: '',
    dropoffAddress: '',
    name: '',
    email: '',
    whatsapp: '',
    requests: '',
    promocode: '',
    discount: 0,
    agent_fee: null,
    agent_name: '',

});

const {
    createApp
} = Vue;

createApp({
        data() {
            return {

                info: '',
                loaded: false,
                //redirect: false,
                rates,
                tour,
                order,
                rules,
                bookingInfo: 0,
            };
        },

        watch: {
            'order.step': 'scrollTop',
            'order.travelDate': 'calculateTourPrice',
            'order.adults': 'calculateTourPrice',
            'order.kids': 'calculateTourPrice',
            'order.children': 'calculateTourPrice',
            'order.selectedTransferId': 'calculateTourPrice',
            'order.selectedCoverId': 'calculateTourPrice',
            'order.discount': 'calculateTourPrice',
            'order.selectedExtras': {
                handler: 'calculateTourPrice',
                deep: true
            },
            'order.selectedProgramId': {
                handler() {
                    this.calculateTourPrice();
                    this.selectRestaurant();
                }
            }
        },

        mounted() {
            if (tour.partner) {
                this.order.deposite = 0;
                this.order.payStep = 3
            }
            this.loaded = true;
            this.calculateTourPrice();
            this.getGaClientId();
        },
        computed:{
            selectedProgram(){
                if(!this.order.selectedProgramId) return null;
                return  this.tour.program?.find(p => p.id === this.order.selectedProgramId);
            },
        },
        methods: {

            //getGaClientId() {
            //    const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
            //    this.order.GaId= match ? match[1] : null;
            //   console.log(this.order.GaId)
            //},


getGaClientId() {
    const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
    if (match) {
        this.order.ga_client_id = match[1];
        console.log('GA client_id:', match[1]);
    } else {
        console.warn('GA client_id not found');
    }
},



            scrollTop() {
                window.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });

                if(this.order.step>2){
                    this.sendBeginCheckout()
                }else if(this.order.step==2){
                    this.addToCart()
                }
            },

            selectRestaurant() {
                const restaurants = this.selectedProgram?.restaurant;

                this.order.restaurant_id =
                    Array.isArray(restaurants) && restaurants.length > 0
                        ? restaurants[0].id
                        : null;
            },

            selectRestaurant() {
                const restaurants = this.selectedProgram?.restaurant;

                this.order.selectedRestaurantId =
                    Array.isArray(restaurants) && restaurants.length > 0
                        ? restaurants[0].id
                        : null;
            },

            //calculator
            calculateTourPrice() {
                const members = this.order.adults + this.order.kids + this.order.children;
                const allMembers = this.order.adults + this.order.kids + this.order.children;
                const numCars = Math.ceil(allMembers / 5);
                const date = new Date(this.order.travelDate);
                let boatPrice = parseFloat(this.tour.boat_price || 0);
                let tourPrice = 0;
                let programPrice = 0;
                let transferPrice = 0
                let coverPrice = 0;
                let extrasTotal = 0;

                let discount = this.order.discount;
                let discountPrice = 0;

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
                        this.order.flash_sale=true
                    }else if (lowPriceInterval) {

                        selectedPackage = lowPriceInterval.packages;
                        this.order.flash_sale=false
                    } else if (matchingIntervals.length > 0) {
                        // если нет интервала с low_price, берём первый попавшийся
                        selectedPackage = matchingIntervals[0].packages;
                        this.order.flash_sale=false
                    }
                }


                // 2. Price
                const match = selectedPackage?.pricelist?.find(
                    i => i.members_count === members
                );
                if (match) {
                    tourPrice = parseFloat(match.price);
                }
                // 6. Program
                if (this.order.selectedProgramId) {
                    const selectedProgram = this.tour.program?.find(
                        p => p.id === this.order.selectedProgramId
                    );
                    if (selectedProgram && !selectedProgram.included) {
                        programPrice = parseFloat(selectedProgram.price * numCars);
                    }
                }

                // 3. Transfer
                if (this.order.selectedTransferId) {
                    const selectedTransfer = this.tour.transfer?.find(
                        t => t.id === this.order.selectedTransferId
                    );
                    transferPrice = selectedTransfer ?
                        selectedTransfer.price * numCars :
                        0;
                }

                // 4. Cover
                if (this.order.selectedCoverId) {
                    const selectedCover = this.tour.cover?.find(
                        c => c.id === this.order.selectedCoverId
                    );
                    if (selectedCover) {
                        if (selectedCover.per_boat) {
                            coverPrice = selectedCover.price;
                        } else {
                            coverPrice = selectedCover.price * members;
                        }
                    }
                }

                // 5. Extras
                if (Array.isArray(this.order.selectedExtras) && this.order.selectedExtras.length > 0) {
                    const extrasMap = {};
                    this.tour.ecategories?.forEach(cat => {
                        cat.extras.forEach(e => {
                            extrasMap[e.id] = e;
                        });
                    });

                    for (const ex of this.order.selectedExtras) {
                        const item = extrasMap[ex.id];
                        if (item) {
                            extrasTotal += parseFloat(item.price) * ex.qty;
                        }
                    }
                }


                if (discount > 0) {
                    discountPrice = tourPrice * discount / 100
                }

                // Total
                this.order.members = members;
                this.order.allMembers = allMembers;
                this.order.cars = numCars;
                this.order.boatPrice = boatPrice;
                this.order.tourPrice = tourPrice;
                this.order.transferPrice = transferPrice;
                this.order.coverPrice = coverPrice;
                this.order.programPrice = programPrice;
                this.order.extrasTotal = extrasTotal;
                this.order.discountPrice = discountPrice;
                this.order.fullPrice = boatPrice + tourPrice + transferPrice + coverPrice + extrasTotal + programPrice;
                this.order.totalPrice = boatPrice + tourPrice + transferPrice + coverPrice + extrasTotal + programPrice - discountPrice;

            },


            showInfo(info) {
                this.info = info;
                setTimeout(() => {
                    this.info = null
                }, 1000);
            },

            share() {
                const params = new URLSearchParams({
                    date: this.order.travelDate,
                    adults: this.order.adults,
                    kids: this.order.kids,
                    children: this.order.children,
                    transfer: this.order.selectedTransferId,
                    cover: this.order.selectedCoverId,
                    program: this.order.selectedProgramId,
                });

                const shareData = {
                    title: this.tour.title,
                    text: this.tour.description,
                    url: `${window.location.origin}${window.location.pathname}?${params.toString()}`,
                };

                if (navigator.share) {
                    navigator.share(shareData)
                        .then(() => console.log('Shared'))
                        .catch(err => console.warn('Error:', err));
                } else {
                    alert('Not supported');
                }
            },
            addToCart() {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                event: 'add_to_cart',
                ecommerce: {
                    value: this.order.totalPrice,
                    currency: 'IDR',
                    items: [
                    {
                        item_id: this.tour.id,
                        item_name: this.tour.name,
                        currency: 'IDR',
                        discount: 5.00,
                        item_brand: 'bluuu',
                        item_category: this.tour.types.name,
                        price: this.order.totalPrice,
                        quantity: 1
                    }
                    ]
                }
                });
            },
            sendBeginCheckout() {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                event: 'begin_checkout',
                ecommerce: {
                    value: this.order.totalPrice,
                    currency: 'IDR',
                    items: [
                    {
                        item_id: this.tour.id,
                        item_name: this.tour.name,
                        currency: 'IDR',
                        discount: 5.00,
                        item_brand: 'bluuu',
                        item_category: this.tour.types.name,
                        price: this.order.totalPrice,
                        quantity: 1
                    }
                    ]
                }
                });
            }

        },
    })

    .component('currency-selector', CurrencySelector)
    .component('promo-code', PromoCode)
    .component('boat-images', BoatImages)
    .component('counter', Counter)
    .component('format-number', FormatNumber)
    .component('format-date', FormatDate)
    .component('prev-date', PrevDate)
    .component('param-selector', ParamSelector)
    .component('info-panel', InfoPanel)
    .component('faq-section', Faq)
    .component('slider', ImageSlider)
    .component('program-slider', ProgramSlider)
    .component('review-slider', ReviewSlider)
    .component('program-selector', ProgramSelector)
    .component('restaurant-selector', RestaurantSelector)
    .component('transfer-selector', TransferSelector)
    .component('cover-selector', CoverSelector)
    .component('extras-selector', ExtrasSelector)
    .component('deposite-selector', DepositeSelector)
    .component('method-selector', MethodSelector)
    .component('contact-details', ContactDetails)
    .provide('order', order)
    .mount("#app");