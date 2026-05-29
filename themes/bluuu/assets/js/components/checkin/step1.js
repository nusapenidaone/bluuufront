const CheckinStep1 = {
    inject: ['order'],
    template: `
    <div class="col-xl-6 col-lg-8 col-md-10">
        <div class="rounded-15 overflow-hidden shadow">

            <!-- Hero banner -->
            <div class="position-relative" style="background:linear-gradient(135deg,#045cff 0%,#0077cc 100%);padding:3rem 2rem 2rem">
                <div class="text-center c-white">
                    <div class="fz-09 fw-600 mb-2" style="opacity:.7;letter-spacing:.1em;text-transform:uppercase">Online Check-in</div>
                    <div class="fz-15 fw-600">Welcome back,</div>
                    <div class="fz-15 fw-600" v-text="order.name"></div>
                    <div class="mt-2 fz-09" style="opacity:.8" v-text="order.order_number"></div>
                </div>
            </div>

            <!-- Order details card -->
            <div class="bg-white p-4 p-xl-5">

                <div class="fz-12 fw-600 c-950 mb-3">Your booking details</div>

                <div class="border-black-10 rounded-3 overflow-hidden mb-4">
                    <div class="d-flex align-items-center p-3">
                        <div class="c-500 flex-grow-1 fz-09">Travel Date</div>
                        <div class="fw-600 c-950"><format-date :date="order.travel_date"></format-date></div>
                    </div>
                    <div class="h-1 bg-black-10"></div>
                    <div class="d-flex align-items-center p-3">
                        <div class="c-500 flex-grow-1 fz-09">Meeting Time</div>
                        <div class="fw-600 c-950" v-text="order.meeting_time"></div>
                    </div>
                    <div class="h-1 bg-black-10"></div>
                    <div class="d-flex align-items-center p-3">
                        <div class="c-500 flex-grow-1 fz-09">Yacht</div>
                        <div class="fw-600 c-950" v-text="order.boat_name || '—'"></div>
                    </div>
                    <div class="h-1 bg-black-10"></div>
                    <div class="d-flex align-items-center p-3">
                        <div class="c-500 flex-grow-1 fz-09">Route</div>
                        <div class="fw-600 c-950" v-text="order.route || '—'"></div>
                    </div>
                    <div class="h-1 bg-black-10"></div>
                    <div class="d-flex align-items-center p-3">
                        <div class="c-500 flex-grow-1 fz-09">Passengers</div>
                        <div class="fw-600 c-950">
                            <span v-text="order.adults"></span> adults
                            <template v-if="order.kids > 0">, <span v-text="order.kids"></span> kids</template>
                        </div>
                    </div>
                    <template v-if="order.collect > 0">
                        <div class="h-1 bg-black-10"></div>
                        <div class="d-flex align-items-center p-3 bg-blue-10">
                            <div class="c-blue flex-grow-1 fz-09 fw-600">Remaining balance</div>
                            <div class="fw-600 c-blue"><format-number :number="order.collect"></format-number></div>
                        </div>
                    </template>
                </div>

                <!-- Meeting point -->
                <div class="bg-100 rounded-3 p-3 d-flex align-items-start gap-3 mb-4">
                    <div class="fz-15 mt-1">📍</div>
                    <div>
                        <div class="fw-600 c-950 fz-09">Meeting point</div>
                        <a class="c-blue fz-09" target="_blank" href="https://maps.app.goo.gl/psZ9yCoLiJ7ZyG4S9">
                            Bluuu Tours office in Serangan Harbor
                        </a>
                    </div>
                </div>

                <div class="text-center">
                    <div class="btn btn-blue px-5" @click="order.step = 2">
                        <span>Start Check-in</span>
                        <svg width="13" class="ms-2" viewBox="0 0 13 11" fill="none">
                            <path d="M10.587 6.19536L0.757826 6.19536C0.338064 6.19536 0 5.89104 0 5.50303C0 5.12517 0.338064 4.81071 0.757826 4.81071L10.5786 4.81071L7.49937 1.63564C7.22329 1.35414 7.24864 0.920484 7.56135 0.671957C7.87406 0.423428 8.34735 0.446252 8.62344 0.727748L12.8098 5.04402C13.069 5.3103 13.0605 5.70338 12.8013 5.95951L8.62062 10.2682C8.34453 10.5497 7.87124 10.5826 7.55854 10.324C7.24583 10.0754 7.22047 9.64179 7.49656 9.36029L10.5758 6.18522L10.587 6.19536Z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
};
