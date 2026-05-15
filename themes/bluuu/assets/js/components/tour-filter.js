const TourFilter = {
    props: [],
    inject: ['order'],
    template: `
    <div id="filter" class="bottom-popup popup-small bg-white p-1 rounded-1 order-lg-0 order-1">

        <div>
            <input ref="travelDateInput" class="d-none">
        </div>
        <div class="h-1 bg-200 my-3"></div>

        <!-- Adults -->
        <div class="d-flex mt-3">
            <div class="flex-grow-1">
                <div class="fw-600">Adults</div>
                <div class="fz-08 c-500">From 14 years old</div>
            </div>
            <div class="counter fz-1">
                <div class="counter-button counter-minus" @click="decrease('adults')"></div>
                <div class="counter-value">{{ adults }}</div>
                <div class="counter-button counter-plus" @click="increase('adults')"></div>
            </div>
        </div>

        <!-- Kids -->
        <div class="d-flex mt-3">
            <div class="flex-grow-1">
                <div class="fw-600">Kids</div>
                <div class="fz-08 c-500">8-13 years old</div>
            </div>
            <div class="counter fz-1">
                <div class="counter-button counter-minus" @click="decrease('kids')"></div>
                <div class="counter-value">{{ kids }}</div>
                <div class="counter-button counter-plus" @click="increase('kids')"></div>
            </div>
        </div>

        <!-- Children -->
        <div class="d-flex mt-3">
            <div class="flex-grow-1">
                <div class="fw-600">Children</div>
                <div class="fz-08 c-500">0-7 years old</div>
            </div>
            <div class="counter fz-1">
                <div class="counter-button counter-minus" @click="decrease('children')"></div>
                <div class="counter-value">{{ children }}</div>
                <div class="counter-button counter-plus" @click="increase('children')"></div>
            </div>
        </div>

        <div class="h-1 bg-200 my-3"></div>

        <!-- Save / Close -->
        <div class="d-flex align-items-end">
            <div class="c-500 fz-09 pe-3">
                Children under 14 years of age must be accompanied by an adult.
            </div>
            <div class="btn btn-blue" @click="save" data-fancybox-close v-if="selectedDate !== ''">Save</div>
            <div class="btn btn-dark" @click="save" data-fancybox-close v-else>Close</div>
        </div>
    </div>
    `,

    data() {
        return {


            calendar: null,
            selectedDate: this.order.travelDate || '',
            adults: this.order.adults || 0,
            kids: this.order.kids || 0,
            children: this.order.children || 0,
        };
    },



    mounted() {
        this.showCalendar();
    },

    methods: {
        showCalendar() {
            this.calendar = flatpickr(this.$refs.travelDateInput, {
                inline: true,
                monthSelectorType: 'static',
                dateFormat: "Y-m-d",
                minDate: new Date().fp_incr(1),
                onChange: (selectedDates, dateStr) => {
                    this.selectedDate = dateStr;
                },
            });
        },

        increase(type) {
            this[type]++;
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
};
