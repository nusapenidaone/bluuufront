const CheckinStep2 = {
    inject: ['order'],
    template: `
    <div class="col-xl-7 col-lg-9">
        <div class="rounded-15 bg-white shadow position-relative">

            <!-- Back button -->
            <div class="p-3 position-absolute start top">
                <div class="btn btn-light btn-circle" @click="order.step = 1">
                    <svg width="13" viewBox="0 0 13 11" fill="none">
                        <path d="M2.413 6.19536H12.2422C12.6619 6.19536 13 5.89104 13 5.50303C13 5.12517 12.6619 4.81071 12.2422 4.81071H2.4214L5.50063 1.63564C5.77671 1.35414 5.75136 0.920483 5.43865 0.671956C5.12594 0.423427 4.65265 0.446251 4.37656 0.727747L0.190202 5.04402C-0.0689978 5.3103 -0.0604977 5.70338 0.198702 5.95951L4.37938 10.2682C4.65547 10.5497 5.12876 10.5826 5.44146 10.324C5.75417 10.0754 5.77953 9.64179 5.50344 9.36029L2.4242 6.18522L2.413 6.19536Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>

            <div class="pt-5 pb-4 px-4 px-xl-5">
                <div class="text-center mb-4">
                    <div class="fz-15 fw-600 c-950">Passenger Information</div>
                    <div class="mt-2 c-500 fz-09">
                        Please provide passenger details for insurance<br>and boarding documentation
                    </div>
                </div>

                <!-- Contact info -->
                <div class="row g-3 mb-4">
                    <div class="col-xl-6">
                        <div class="mb-2 ms-1 fz-09 fw-600 c-950">Email <span class="c-orange">*</span></div>
                        <input class="input" type="email" v-model="order.email" placeholder="your@email.com">
                        <div class="c-red fz-08 ms-1 mt-1" v-if="showEmailError && !validateEmail">
                            Valid email is required
                        </div>
                    </div>
                    <div class="col-xl-6">
                        <div class="mb-2 ms-1 fz-09 fw-600 c-950">WhatsApp</div>
                        <input class="input" type="tel" v-model="order.phone" placeholder="+62 8xx xxxx xxxx">
                    </div>
                </div>

                <div class="h-1 bg-black-10 mb-4"></div>

                <div class="fz-12 fw-600 c-950 mb-3">
                    Passengers
                    <span class="fw-400 c-500 fz-09 ms-2" v-text="order.count_of_people + ' total'"></span>
                </div>

                <template v-for="(p, index) in passengersData" :key="index">
                    <div class="mb-3 p-3 rounded-3 bg-100">
                        <div class="fz-09 fw-600 c-500 mb-2">Passenger {{ index + 1 }}</div>
                        <div class="row g-2">
                            <div class="col-12">
                                <input class="input" type="text"
                                    :placeholder="'Full name (Passenger ' + (index + 1) + ')'"
                                    v-model="p.name">
                            </div>
                            <div class="col-4">
                                <select class="input select" v-model="p.age">
                                    <option disabled value="">Age</option>
                                    <option v-for="i in 100" :key="i" :value="i" v-text="i"></option>
                                </select>
                            </div>
                            <div class="col-4">
                                <select class="input select" v-model="p.gender">
                                    <option disabled value="">Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div class="col-4">
                                <select class="input select" v-model="p.country">
                                    <option disabled value="">Country</option>
                                    <option v-for="(c, i) in countries" :key="i" :value="c.name" v-text="c.name"></option>
                                </select>
                            </div>
                        </div>
                    </div>
                </template>

                <div class="text-center mt-4">
                    <template v-if="!loading">
                        <!-- If collect > 0: go to payment step, else finish -->
                        <div class="btn btn-blue px-5" @click="next()" v-if="order.collect > 0">
                            <span>Next step</span>
                            <svg width="13" class="ms-2" viewBox="0 0 13 11" fill="none">
                                <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="btn btn-blue px-5" @click="finish()" v-else>
                            <span>Complete Check-in</span>
                            <svg width="13" class="ms-2" viewBox="0 0 13 11" fill="none">
                                <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </template>
                    <template v-else>
                        <button class="btn btn-light" disabled>
                            <span class="me-2">Please wait</span>
                            <span class="preloading1">·</span>
                            <span class="preloading2">·</span>
                            <span class="preloading3">·</span>
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            passengersData: [],
            showEmailError: false,
            loading: false,
            countries: [{"name":"Afghanistan","code":"AF"},{"name":"Albania","code":"AL"},{"name":"Algeria","code":"DZ"},{"name":"Argentina","code":"AR"},{"name":"Armenia","code":"AM"},{"name":"Australia","code":"AU"},{"name":"Austria","code":"AT"},{"name":"Azerbaijan","code":"AZ"},{"name":"Bahamas","code":"BS"},{"name":"Bahrain","code":"BH"},{"name":"Bangladesh","code":"BD"},{"name":"Belarus","code":"BY"},{"name":"Belgium","code":"BE"},{"name":"Brazil","code":"BR"},{"name":"Bulgaria","code":"BG"},{"name":"Cambodia","code":"KH"},{"name":"Canada","code":"CA"},{"name":"Chile","code":"CL"},{"name":"China","code":"CN"},{"name":"Colombia","code":"CO"},{"name":"Croatia","code":"HR"},{"name":"Czech Republic","code":"CZ"},{"name":"Denmark","code":"DK"},{"name":"Egypt","code":"EG"},{"name":"Estonia","code":"EE"},{"name":"Finland","code":"FI"},{"name":"France","code":"FR"},{"name":"Georgia","code":"GE"},{"name":"Germany","code":"DE"},{"name":"Ghana","code":"GH"},{"name":"Greece","code":"GR"},{"name":"Hong Kong","code":"HK"},{"name":"Hungary","code":"HU"},{"name":"India","code":"IN"},{"name":"Indonesia","code":"ID"},{"name":"Iran","code":"IR"},{"name":"Iraq","code":"IQ"},{"name":"Ireland","code":"IE"},{"name":"Israel","code":"IL"},{"name":"Italy","code":"IT"},{"name":"Japan","code":"JP"},{"name":"Jordan","code":"JO"},{"name":"Kazakhstan","code":"KZ"},{"name":"Kenya","code":"KE"},{"name":"Korea, Republic of","code":"KR"},{"name":"Kuwait","code":"KW"},{"name":"Latvia","code":"LV"},{"name":"Lebanon","code":"LB"},{"name":"Lithuania","code":"LT"},{"name":"Malaysia","code":"MY"},{"name":"Mexico","code":"MX"},{"name":"Morocco","code":"MA"},{"name":"Netherlands","code":"NL"},{"name":"New Zealand","code":"NZ"},{"name":"Nigeria","code":"NG"},{"name":"Norway","code":"NO"},{"name":"Pakistan","code":"PK"},{"name":"Palestine","code":"PS"},{"name":"Philippines","code":"PH"},{"name":"Poland","code":"PL"},{"name":"Portugal","code":"PT"},{"name":"Qatar","code":"QA"},{"name":"Romania","code":"RO"},{"name":"Russian Federation","code":"RU"},{"name":"Saudi Arabia","code":"SA"},{"name":"Serbia","code":"RS"},{"name":"Singapore","code":"SG"},{"name":"Slovakia","code":"SK"},{"name":"Slovenia","code":"SI"},{"name":"South Africa","code":"ZA"},{"name":"Spain","code":"ES"},{"name":"Sri Lanka","code":"LK"},{"name":"Sweden","code":"SE"},{"name":"Switzerland","code":"CH"},{"name":"Taiwan","code":"TW"},{"name":"Thailand","code":"TH"},{"name":"Tunisia","code":"TN"},{"name":"Turkey","code":"TR"},{"name":"Ukraine","code":"UA"},{"name":"United Arab Emirates","code":"AE"},{"name":"United Kingdom","code":"GB"},{"name":"United States","code":"US"},{"name":"Uzbekistan","code":"UZ"},{"name":"Venezuela","code":"VE"},{"name":"Viet Nam","code":"VN"}],
        };
    },
    watch: {
        'order.count_of_people': {
            immediate: true,
            handler(n) {
                const prev = this.passengersData;
                this.passengersData = Array.from({ length: n }, (_, i) => ({
                    name:    prev[i]?.name    || '',
                    age:     prev[i]?.age     || '',
                    gender:  prev[i]?.gender  || '',
                    country: prev[i]?.country || '',
                }));
                this.order.passengers = JSON.parse(JSON.stringify(this.passengersData));
            },
        },
        passengersData: {
            deep: true,
            handler(v) {
                this.order.passengers = JSON.parse(JSON.stringify(v));
            },
        },
    },
    computed: {
        validateEmail() {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.order.email);
        },
    },
    methods: {
        next() {
            this.showEmailError = true;
            if (!this.validateEmail) return;
            this.order.step = 3;
        },
        finish() {
            this.showEmailError = true;
            if (!this.validateEmail) return;
            this.loading = true;
            this.$emit('save');
        },
    },
};
