const ParamSelector={
    props: ['tour','current'],
    inject: ['order'],
    template:`
    <div id="params" class="bottom-popup popup-small bg-white p-1 rounded-1 order-lg-0 order-1">
        <div v-if="loading==true" class="ratio-1x1">
            <div class="fw-600 c-950 d-flex align-items-center justify-content-center ratio-1x1">
                <span>Loading available dates</span>
                <span class="preloading1 c-blue">·</span>
                <span class="preloading2 c-blue">·</span>
                <span class="preloading3 c-blue">·</span>
            </div>
        </div>
        <div v-show="loading==false" >
            <input ref="travelDateInput" class="d-none">
            <div class="d-flex align-items-center mt-3 fz-08 c-500">
                <div class="p-2 rounded-2 bg-green me-2"></div> Lowest Price dates
            </div>
            <div class="d-flex align-items-center mt-3 fz-08 c-500">
                <div class="p-2 rounded-2 bg-blue me-2"></div> Flash Sale
            </div>
        </div>
        <div class="h-1 bg-200 my-3"></div>
        <div class="d-flex mt-2 d-none">
            <div class="flex-grow-1">
                <div class="fw-600">{{tour.capacity}}&nbsp; passengers</div>
                <div class="fz-09 c-500">Maximum allowed</div>
            </div>
        </div>
        <div class="d-flex mt-3">
            <div class="flex-grow-1">
                <div class="fw-600">Adults</div>
                <div class="fz-08 c-500">From 14 years old</div>
            </div>
            <div class="counter fz-1">
                <div class="counter-button counter-minus" v-on:click="decrease('adults')"></div>
                <div class="counter-value">{{ adults }}</div>
                <div class="counter-button counter-plus" :class="{ disabled: isFull }" v-on:click="increase('adults')"></div>
            </div>
        </div>
        <div class="d-flex mt-3">
            <div class="flex-grow-1">
                <div class="fw-600">Kids</div>
                <div class="fz-08 c-500">8-13 years old</div>
            </div>
            <div class="counter fz-1">
                <div class="counter-button counter-minus" v-on:click="decrease('kids')"></div>
                <div class="counter-value">{{ kids }}</div>
                <div class="counter-button counter-plus" :class="{ disabled: isFull }" v-on:click="increase('kids')"></div>
            </div>
        </div>
        <div class="d-flex mt-3" v-if="tour.types_id>1">
            <div class="flex-grow-1">
                <div class="fw-600">Children</div>
                <div class="fz-08 c-500">0-7 years old</div>
            </div>
            <div class="counter fz-1">
                <div class="counter-button counter-minus" v-on:click="decrease('children')"></div>
                <div class="counter-value">{{ children }}</div>
                <div class="counter-button counter-plus" :class="{ disabled: isFull }" v-on:click="increase('children')"></div>
            </div>
        </div>
        <div class="h-1 bg-200 my-3"></div>
        <div class="d-flex alig-items-end">
            <div class="c-500 fz-09 pe-3">Children under 14 years of age must be accompanied by an adult.</div>
            <div class="btn btn-blue" v-on:click="save" data-fancybox-close v-if="selectedDate!=''">Save</div>
            <div class="btn btn-dark" v-on:click="save" data-fancybox-close v-else>Close</div>
        </div>
    </div>
    `,

    data() {
        return {
            loading: true,
            datesToHighlight: [],
            closed: [],
            calendar: null,
            selectedDate: null,
            adults: 0,
            kids: 0,
            children: 0,
        };
    },
    watch: {
        'order.adults': {
            immediate: true,
            handler(val) {
                this.adults = val;
            }
        },
        'order.kids': {
            immediate: true,
            handler(val) {
                this.kids = val;
            }
        },
        'order.children': {
            immediate: true,
            handler(val) {
                this.children = val;
            }
        }
    },
    computed: {
        total() {
            return this.adults + this.kids + this.children;
        },
        isFull() {
            return this.total >= this.tour.capacity;
        }
    },

    mounted() {
        window.addEventListener("load", () => {
            this.checkDate();
        });
    },

    methods: {
        async checkDate() {
            this.loading = true;
            try {
                const response = await axios.get('/api/tours/closed/'+this.tour.id)
                this.closed = response.data
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false;
                this.showCaledar();
                this.applycurrent()
            }
        },

        applycurrent() {

            if (!this.current) return;

            // проверяем совпадение в закрытых датах
            const isClosed = this.closed.includes(this.current);

            if (isClosed) {
                // если дата закрыта → сбросить
                this.order.travelDate = null;
                this.selectedDate = null;

            } else {
                // иначе применить
                this.order.travelDate = this.current;
                this.selectedDate = this.current;
        
            }
        },


        //new code    
        getDatesWithClasses() {
            const data = this.tour.pricesbydates;
            if (!Array.isArray(data) || data.length === 0) return {};

            const datesMap = {};

            data.forEach(item => {
                const start = new Date(item.date_start);
                const end = new Date(item.date_end);

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const formatted = d.toISOString().split("T")[0];

                    if (item.flash_sale) {
                        datesMap[formatted] = 'flash_sale';
                    } else if (item.low_price && !datesMap[formatted]) {
                        datesMap[formatted] = 'low_price';
                    }
                }
            });

            return datesMap;
        },

        showCaledar() {
            const datesMap = this.getDatesWithClasses();

            this.calendar = flatpickr(this.$refs.travelDateInput, {
                inline: true,
                monthSelectorType: 'static',
                dateFormat: "Y-m-d",
                disable: this.closed,
                defaultDate: this.order.travelDate ,
                minDate: new Date().fp_incr(+1),
                onChange: (selectedDates, dateStr) => {
                    this.selectedDate = dateStr;
                },
                onDayCreate: (dObj, dStr, fp, dayElem) => {
                    const formattedDate = fp.formatDate(dayElem.dateObj, "Y-m-d");
                    if (datesMap[formattedDate]) {
                        dayElem.classList.add(datesMap[formattedDate]);
                    }
                }
            });
        },

        increase(type) {
            if (this.total < this.tour.capacity) {
                this[type]++;
            }
        },
        decrease(type) {
            if (this[type] > 0) {
                this[type]--;
            }
        },
        save() {
            this.order.adults = this.adults;
            this.order.kids = this.kids;
            this.order.children = this.children;
            this.order.travelDate = this.selectedDate;
            this.$emit('close');
        },

    },

}