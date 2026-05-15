const SearchFilter={
    props: ['types'],
    inject: ['order'],
    template: `

        <div class="position-relative">
            <form class="filter border-black-10 rounded-1 bg-white" v-on:submit.prevent="save">
                <div class="row gx-0 align-items-center justify-content-between">

                    <div class="col position-relative">
                        <div class="px-xl-4 py-xl-3 px-2 py-2 rounded-1 pointer" v-on:click="dropdown=2">
                            <div class="fz-09 c-500 lh-1">Travel Date</div>
                            <div class="fw-600 text-nowrap">
                                <format-date v-bind:date="selectedDate"></format-date>
                            </div>
                        </div>
                    </div>
                    <div class="col-auto c-500">|</div>
                    <div class="col position-relative">
                        <div class="px-xl-4 py-xl-3 px-2 py-2 rounded-1 pointer" v-on:click="dropdown=3">
                            <div class="fz-09 c-500 lh-1">Members</div>
                            <div class="fw-600 text-nowrap" v-text="members+' person'"></div>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="p-2">
                            <button class="btn btn-orange fz-1 p-3">
                                <i class="search-icon fz-15 "></i>
                                <span class="mx-2 d-xl-inline d-none ">Search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

          
  
                <div class="position-absolute z-2 start end" key="1" v-show="dropdown==1">
                    <div class="row" >
                        <div class="col-xl-6 order-first" >
                            <div class="shadow dropdown  z-2 type-selector bg-white rounded-1 p-3 border-black-10">
                                <div class="p-3 d-flex align-items-center rounded-1 bg-100-hover pointer" :class="selectedType == null && 'bg-100'" v-on:click="selectedType=null, dropdown=false">
                                    <span class="ms-2 fw-600">All Tours</span>
                                </div>
                                
                                <template v-for="type in types" :key="type.id">
                                    
                                    <div class="p-3 d-flex align-items-center rounded-1 bg-100-hover pointer" :class="selectedType == type && 'bg-100'" v-on:click="selectedType=type, dropdown=false">
                                        <i class="fz-15" :class="type.slug+'-icon'"></i><span class="ms-2 fw-600">{{type.name}}</span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="position-absolute z-2 start end" key="2" v-show="dropdown==2">
                    <div class="row">
                        <div class="col"></div>
                        <div class="col-xl-6">
                            <div class="shadow dropdown  z-2 date-selector bg-white rounded-1 p-3 border-black-10">
                                <div class="max-400">
                                    <input ref="travelDateInput" class="d-none">
                                </div>
                            </div>
                        </div>
                        <div class="col"></div>
                    </div>
                </div>

                <div class="position-absolute z-2 start end" key="3" v-show="dropdown==3">
                    <div class="row">
                        <div class="col"></div>
                        <div class="col-xl-6">
                            <div class="shadow dropdown z-2 members-selector bg-white rounded-1 p-3 border-black-10">
                                <!-- Adults -->
                                <div class="d-flex p-3">
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
                                <div class="h-1 bg-black-10"></div>
                                <div class="d-flex p-3">
                                    <div class="flex-grow-1">
                                        <div class="fw-600">Kids</div>
                                        <div class="fz-08 c-500">8-13 years old
                                        <br>
                                        1-7 years old&nbsp; (private tours only)
                                        </div>
                                    </div>
                                    <div class="counter fz-1">
                                        <div class="counter-button counter-minus" @click="decrease('kids')"></div>
                                        <div class="counter-value">{{ kids }}</div>
                                        <div class="counter-button counter-plus" @click="increase('kids')"></div>
                                    </div>
                                </div>

                                

                                
                            </div>
                        </div>
                    </div>
                </div>
               
            

        </div>

    `,
    data(){
        return{
            dropdown: false,
            calendar: null,
            selectedDate: this.order.travelDate || '',
            adults: this.order.adults || 0,
            kids: this.order.kids || 0,
            children: this.order.children || 0,
            selectedType: this.order.selectedType
        }
    },
    mounted(){
        this.showCalendar();
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
    },
    computed:{
        members(){
            return this.adults + this.kids + this.children
        }
    },
    methods:{
        save() {
            this.order.selectedType=this.selectedType;
            this.order.adults = this.adults;
            this.order.kids = this.kids;
            this.order.children = this.children;
            this.order.travelDate = this.selectedDate;
            this.dropdown=false;
            this.$emit('close');
        },
        showCalendar() {

 

            this.calendar = flatpickr(this.$refs.travelDateInput, {
                inline: true,
                monthSelectorType: 'static',
                dateFormat: "Y-m-d",
                defaultDate: this.order.travelDate ,
                minDate: new Date().fp_incr(1),
                onChange: (selectedDates, dateStr) => {
                    this.selectedDate = dateStr;
                    this.dropdown=false
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

        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.dropdown = false;
            }
        }
    },
}