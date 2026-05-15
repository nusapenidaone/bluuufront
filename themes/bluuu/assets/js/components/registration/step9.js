const Step9={

    inject: ['order'],
    template: `
    
    <div class="col-xl-8">
    <div class="rounded-15 py-5 px-xl-5 px-4 bg-white shadow position-relative">
        <div class="p-2 position-absolute start top">
            <div class="btn btn-light btn-circle" @click="order.step=2">
                <svg width="13" viewBox="0 0 13 11" fill="none">
                    <path d="M2.413 6.19536H12.2422C12.6619 6.19536 13 5.89104 13 5.50303C13 5.12517 12.6619 4.81071 12.2422 4.81071H2.4214L5.50063 1.63564C5.77671 1.35414 5.75136 0.920483 5.43865 0.671956C5.12594 0.423427 4.65265 0.446251 4.37656 0.727747L0.190202 5.04402C-0.0689978 5.3103 -0.0604977 5.70338 0.198702 5.95951L4.37938 10.2682C4.65547 10.5497 5.12876 10.5826 5.44146 10.324C5.75417 10.0754 5.77953 9.64179 5.50344 9.36029L2.4242 6.18522L2.413 6.19536Z" fill="currentColor" />
                </svg>
            </div>
        </div>
        <div class="fz-15 fw-600 c-950 text-center">
            Dear, Lead <span v-text="order.name"></span>
        </div>
        <div class="mt-2 text-center c-500">
            Please provide the following information — it will <br>
            be used to ensure accurate insurance coverage <br>
            and prepare your boarding documentation.
        </div>
        <form class="mt-3">
            <div class="row">
                <div class="col-xl-6 mt-3">
                    <div class="mb-2 ms-2">Email<span class="c-orange">*</span></div>
                    <div>
                        <input class="input" type="email" v-model="order.email" placeholder="Enter your email address">
                    </div>
                    <div class="c-red fz-08 ms-2" v-if="!validateEmail">Email is required. Must be a valid email address.</div>
                </div>
                <div class="col-xl-6 mt-3">
                    <div class="mb-2 ms-2">Whatsapp Number</div>
                    <div>
                        <input class="input" type="tel" v-model="order.phone" placeholder="Whatsapp Number with Country Code">
                    </div>
                </div>
            </div>
            <div class="h-1 bg-black-10 mt-4"></div>
            <div class="mt-3">
                <div class="fz-12 c-950 fw-600">
                    Passengers
                </div>
            </div>
            <div>
                <template v-for="(p, index) in passengersData" v-bind:key="index">
                    <div class="row gx-l-4 g-2 align-items-end mt-4">
                        <div class="col-xl">
                            <input class="input" type="text" v-bind:placeholder="'Passenger&nbsp;' + (index+1) +  '&nbsp;Name'" v-model="p.name" />
                        </div>
                        <div class="col-xl-auto col-3">
                            <select class="input select" v-model="p.age">
                                <option disabled value="">Age</option>
                                <option v-for="i in 100" v-bind:key="i" v-bind:value="i" v-text="i"></option>
                            </select>
                        </div>
                        <div class="col-xl-auto col-4">
                            <select class="input select" v-model="p.gender">
                                <option disabled value="">Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div class="col-xl-3 col-5">
                            <select class="input select" v-model="p.country">
                                <option disabled value="">Country</option>
                                <option v-for="(c, i) in country" v-bind:key="i" v-bind:value="c.name" v-text="c.name"></option>
                            </select>
                        </div>
                    </div>
                </template>
            </div>
        </form>
        <div class="text-center">


            <template v-if="loading==false">

            <div class="btn btn-blue mt-4" v-on:click="nextStep()"  v-if="order.collect>0">
                <span>Next step </span>
                <svg width="13" class="arrow-icon ms-2" viewBox="0 0 13 11" fill="none">
                    <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"></path>
                </svg>

            </div>
            <div class="btn btn-blue mt-4" v-on:click="save()" v-else>
                    <span>Finish </span>
                    <svg width="13" class="arrow-icon ms-2" viewBox="0 0 13 11" fill="none">
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
        return {

            country: [{"name":"Afghanistan","code":"AF"},{"name":"\u00c5land Islands","code":"AX"},{"name":"Albania","code":"AL"},{"name":"Algeria","code":"DZ"},{"name":"American Samoa","code":"AS"},{"name":"Andorra","code":"AD"},{"name":"Angola","code":"AO"},{"name":"Anguilla","code":"AI"},{"name":"Antarctica","code":"AQ"},{"name":"Antigua and Barbuda","code":"AG"},{"name":"Argentina","code":"AR"},{"name":"Armenia","code":"AM"},{"name":"Aruba","code":"AW"},{"name":"Australia","code":"AU"},{"name":"Austria","code":"AT"},{"name":"Azerbaijan","code":"AZ"},{"name":"Bahamas","code":"BS"},{"name":"Bahrain","code":"BH"},{"name":"Bangladesh","code":"BD"},{"name":"Barbados","code":"BB"},{"name":"Belarus","code":"BY"},{"name":"Belgium","code":"BE"},{"name":"Belize","code":"BZ"},{"name":"Benin","code":"BJ"},{"name":"Bermuda","code":"BM"},{"name":"Bhutan","code":"BT"},{"name":"Bolivia","code":"BO"},{"name":"Bosnia and Herzegovina","code":"BA"},{"name":"Botswana","code":"BW"},{"name":"Bouvet Island","code":"BV"},{"name":"Brazil","code":"BR"},{"name":"British Indian Ocean Territory","code":"IO"},{"name":"Brunei Darussalam","code":"BN"},{"name":"Bulgaria","code":"BG"},{"name":"Burkina Faso","code":"BF"},{"name":"Burundi","code":"BI"},{"name":"Cambodia","code":"KH"},{"name":"Cameroon","code":"CM"},{"name":"Canada","code":"CA"},{"name":"Cape Verde","code":"CV"},{"name":"Cayman Islands","code":"KY"},{"name":"Central African Republic","code":"CF"},{"name":"Chad","code":"TD"},{"name":"Chile","code":"CL"},{"name":"China","code":"CN"},{"name":"Christmas Island","code":"CX"},{"name":"Cocos (Keeling) Islands","code":"CC"},{"name":"Colombia","code":"CO"},{"name":"Comoros","code":"KM"},{"name":"Congo","code":"CG"},{"name":"Congo, The Democratic Republic of the","code":"CD"},{"name":"Cook Islands","code":"CK"},{"name":"Costa Rica","code":"CR"},{"name":"Cote D'Ivoire","code":"CI"},{"name":"Croatia","code":"HR"},{"name":"Cuba","code":"CU"},{"name":"Cyprus","code":"CY"},{"name":"Czech Republic","code":"CZ"},{"name":"Denmark","code":"DK"},{"name":"Djibouti","code":"DJ"},{"name":"Dominica","code":"DM"},{"name":"Dominican Republic","code":"DO"},{"name":"Ecuador","code":"EC"},{"name":"Egypt","code":"EG"},{"name":"El Salvador","code":"SV"},{"name":"Equatorial Guinea","code":"GQ"},{"name":"Eritrea","code":"ER"},{"name":"Estonia","code":"EE"},{"name":"Ethiopia","code":"ET"},{"name":"Falkland Islands (Malvinas)","code":"FK"},{"name":"Faroe Islands","code":"FO"},{"name":"Fiji","code":"FJ"},{"name":"Finland","code":"FI"},{"name":"France","code":"FR"},{"name":"French Guiana","code":"GF"},{"name":"French Polynesia","code":"PF"},{"name":"French Southern Territories","code":"TF"},{"name":"Gabon","code":"GA"},{"name":"Gambia","code":"GM"},{"name":"Georgia","code":"GE"},{"name":"Germany","code":"DE"},{"name":"Ghana","code":"GH"},{"name":"Gibraltar","code":"GI"},{"name":"Greece","code":"GR"},{"name":"Greenland","code":"GL"},{"name":"Grenada","code":"GD"},{"name":"Guadeloupe","code":"GP"},{"name":"Guam","code":"GU"},{"name":"Guatemala","code":"GT"},{"name":"Guernsey","code":"GG"},{"name":"Guinea","code":"GN"},{"name":"Guinea-Bissau","code":"GW"},{"name":"Guyana","code":"GY"},{"name":"Haiti","code":"HT"},{"name":"Heard Island and Mcdonald Islands","code":"HM"},{"name":"Holy See (Vatican City State)","code":"VA"},{"name":"Honduras","code":"HN"},{"name":"Hong Kong","code":"HK"},{"name":"Hungary","code":"HU"},{"name":"Iceland","code":"IS"},{"name":"India","code":"IN"},{"name":"Indonesia","code":"ID"},{"name":"Iran, Islamic Republic Of","code":"IR"},{"name":"Iraq","code":"IQ"},{"name":"Ireland","code":"IE"},{"name":"Isle of Man","code":"IM"},{"name":"Israel","code":"IL"},{"name":"Italy","code":"IT"},{"name":"Jamaica","code":"JM"},{"name":"Japan","code":"JP"},{"name":"Jersey","code":"JE"},{"name":"Jordan","code":"JO"},{"name":"Kazakhstan","code":"KZ"},{"name":"Kenya","code":"KE"},{"name":"Kiribati","code":"KI"},{"name":"Korea, Democratic People'S Republic of","code":"KP"},{"name":"Korea, Republic of","code":"KR"},{"name":"Kuwait","code":"KW"},{"name":"Kyrgyzstan","code":"KG"},{"name":"Lao People'S Democratic Republic","code":"LA"},{"name":"Latvia","code":"LV"},{"name":"Lebanon","code":"LB"},{"name":"Lesotho","code":"LS"},{"name":"Liberia","code":"LR"},{"name":"Libyan Arab Jamahiriya","code":"LY"},{"name":"Liechtenstein","code":"LI"},{"name":"Lithuania","code":"LT"},{"name":"Luxembourg","code":"LU"},{"name":"Macao","code":"MO"},{"name":"Macedonia, The Former Yugoslav Republic of","code":"MK"},{"name":"Madagascar","code":"MG"},{"name":"Malawi","code":"MW"},{"name":"Malaysia","code":"MY"},{"name":"Maldives","code":"MV"},{"name":"Mali","code":"ML"},{"name":"Malta","code":"MT"},{"name":"Marshall Islands","code":"MH"},{"name":"Martinique","code":"MQ"},{"name":"Mauritania","code":"MR"},{"name":"Mauritius","code":"MU"},{"name":"Mayotte","code":"YT"},{"name":"Mexico","code":"MX"},{"name":"Micronesia, Federated States of","code":"FM"},{"name":"Moldova, Republic of","code":"MD"},{"name":"Monaco","code":"MC"},{"name":"Mongolia","code":"MN"},{"name":"Montserrat","code":"MS"},{"name":"Morocco","code":"MA"},{"name":"Mozambique","code":"MZ"},{"name":"Myanmar","code":"MM"},{"name":"Namibia","code":"NA"},{"name":"Nauru","code":"NR"},{"name":"Nepal","code":"NP"},{"name":"Netherlands","code":"NL"},{"name":"Netherlands Antilles","code":"AN"},{"name":"New Caledonia","code":"NC"},{"name":"New Zealand","code":"NZ"},{"name":"Nicaragua","code":"NI"},{"name":"Niger","code":"NE"},{"name":"Nigeria","code":"NG"},{"name":"Niue","code":"NU"},{"name":"Norfolk Island","code":"NF"},{"name":"Northern Mariana Islands","code":"MP"},{"name":"Norway","code":"NO"},{"name":"Oman","code":"OM"},{"name":"Pakistan","code":"PK"},{"name":"Palau","code":"PW"},{"name":"Palestinian Territory, Occupied","code":"PS"},{"name":"Panama","code":"PA"},{"name":"Papua New Guinea","code":"PG"},{"name":"Paraguay","code":"PY"},{"name":"Peru","code":"PE"},{"name":"Philippines","code":"PH"},{"name":"Pitcairn","code":"PN"},{"name":"Poland","code":"PL"},{"name":"Portugal","code":"PT"},{"name":"Puerto Rico","code":"PR"},{"name":"Qatar","code":"QA"},{"name":"Reunion","code":"RE"},{"name":"Romania","code":"RO"},{"name":"Russian Federation","code":"RU"},{"name":"RWANDA","code":"RW"},{"name":"Saint Helena","code":"SH"},{"name":"Saint Kitts and Nevis","code":"KN"},{"name":"Saint Lucia","code":"LC"},{"name":"Saint Pierre and Miquelon","code":"PM"},{"name":"Saint Vincent and the Grenadines","code":"VC"},{"name":"Samoa","code":"WS"},{"name":"San Marino","code":"SM"},{"name":"Sao Tome and Principe","code":"ST"},{"name":"Saudi Arabia","code":"SA"},{"name":"Senegal","code":"SN"},{"name":"Serbia and Montenegro","code":"CS"},{"name":"Seychelles","code":"SC"},{"name":"Sierra Leone","code":"SL"},{"name":"Singapore","code":"SG"},{"name":"Slovakia","code":"SK"},{"name":"Slovenia","code":"SI"},{"name":"Solomon Islands","code":"SB"},{"name":"Somalia","code":"SO"},{"name":"South Africa","code":"ZA"},{"name":"South Georgia and the South Sandwich Islands","code":"GS"},{"name":"Spain","code":"ES"},{"name":"Sri Lanka","code":"LK"},{"name":"Sudan","code":"SD"},{"name":"Suriname","code":"SR"},{"name":"Svalbard and Jan Mayen","code":"SJ"},{"name":"Swaziland","code":"SZ"},{"name":"Sweden","code":"SE"},{"name":"Switzerland","code":"CH"},{"name":"Syrian Arab Republic","code":"SY"},{"name":"Taiwan, Province of China","code":"TW"},{"name":"Tajikistan","code":"TJ"},{"name":"Tanzania, United Republic of","code":"TZ"},{"name":"Thailand","code":"TH"},{"name":"Timor-Leste","code":"TL"},{"name":"Togo","code":"TG"},{"name":"Tokelau","code":"TK"},{"name":"Tonga","code":"TO"},{"name":"Trinidad and Tobago","code":"TT"},{"name":"Tunisia","code":"TN"},{"name":"Turkey","code":"TR"},{"name":"Turkmenistan","code":"TM"},{"name":"Turks and Caicos Islands","code":"TC"},{"name":"Tuvalu","code":"TV"},{"name":"Uganda","code":"UG"},{"name":"Ukraine","code":"UA"},{"name":"United Arab Emirates","code":"AE"},{"name":"United Kingdom","code":"GB"},{"name":"United States","code":"US"},{"name":"United States Minor Outlying Islands","code":"UM"},{"name":"Uruguay","code":"UY"},{"name":"Uzbekistan","code":"UZ"},{"name":"Vanuatu","code":"VU"},{"name":"Venezuela","code":"VE"},{"name":"Viet Nam","code":"VN"},{"name":"Virgin Islands, British","code":"VG"},{"name":"Virgin Islands, U.S.","code":"VI"},{"name":"Wallis and Futuna","code":"WF"},{"name":"Western Sahara","code":"EH"},{"name":"Yemen","code":"YE"},{"name":"Zambia","code":"ZM"},{"name":"Zimbabwe","code":"ZW"}],
            passengersData: [],
            loading: false


        }
    },
    watch: {
        'order.count_of_people': {
            immediate: true,
            handler(newCount) {
                const prev = this.passengersData;
                this.passengersData = Array.from({ length: newCount }, (_, i) => ({
                    name: prev[i]?.name || '',
                    age: prev[i]?.age || '',
                    gender: prev[i]?.gender || '',
                    country: prev[i]?.country || ''
                }));
                this.order.passengers = JSON.parse(JSON.stringify(this.passengersData));
            }
        },

        passengersData: {
            deep: true,
            handler(newVal) {
                this.order.passengers = JSON.parse(JSON.stringify(newVal));
            }
        }
    },
    computed: {
        validateEmail() {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.order.email);
        }
    },

    methods:{
        save(){
            if(!this.validateEmail) return false;
            if(this.order.is_first_class) { this.order.step=12; return; }
            this.loading=true;
            this.$emit('save');
        },

        nextStep(){
            if(!this.validateEmail) return false;
            this.order.step = this.order.is_first_class ? 12 : 10;
        }

    }

}