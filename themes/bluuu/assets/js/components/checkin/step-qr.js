const CheckinQr = {
    inject: ['order'],
    template: `
    <div class="col-xl-5 col-lg-7">
        <div class="bg-black-10 px-xl-5 px-4 py-5 rounded-15 text-center">

            <img src="/themes/bluuu/assets/img/logo-white.svg" alt="Bluuu" style="height:32px">

            <div class="c-white mt-4">
                <div class="fz-12 fw-600">Dear {{ order.qr_name || order.name }}</div>
                <div class="mt-2 fz-09" style="opacity:.85">
                    Check-in complete! We look forward to seeing you soon.
                </div>
            </div>

            <!-- Trip details -->
            <div class="bg-white rounded-15 p-4 mt-4">
                <div class="c-950 fw-600 mb-3">Your trip details</div>
                <ul class="list-unstyled text-start c-500 fz-09 mb-0">
                    <li class="d-flex align-items-center py-2 border-bottom border-black-10">
                        <span class="flex-grow-1">Travel Date</span>
                        <span class="fw-600 c-950">
                            <format-date :date="order.qr_date || order.travel_date"></format-date>
                        </span>
                    </li>
                    <li class="d-flex align-items-center py-2 border-bottom border-black-10">
                        <span class="flex-grow-1">Meeting Time</span>
                        <span class="fw-600 c-950" v-text="order.qr_time || order.meeting_time"></span>
                    </li>
                    <li class="d-flex align-items-center py-2 border-bottom border-black-10">
                        <span class="flex-grow-1">Yacht</span>
                        <span class="fw-600 c-950" v-text="order.boat_name || '—'"></span>
                    </li>
                    <li class="d-flex align-items-center py-2">
                        <span class="flex-grow-1">Meeting Point</span>
                        <a class="fw-600 c-blue fz-08 text-end" style="max-width:60%" target="_blank" href="https://maps.app.goo.gl/psZ9yCoLiJ7ZyG4S9">
                            Bluuu Tours office<br>in Serangan Harbor
                        </a>
                    </li>
                </ul>
            </div>

            <!-- QR code -->
            <div class="bg-white p-4 rounded-15 mt-3" v-if="order.qr">
                <div class="c-950 fw-600 mb-2">Your Check-In QR Code</div>
                <div class="c-500 fz-08 mb-3">
                    Show this code to our manager at the check-in desk
                </div>
                <img :src="order.qr" alt="QR Code" class="w-100 rounded-3">
            </div>

            <!-- Download PDF -->
            <a v-if="order.pdf" :href="order.pdf" download="bluuu-checkin.pdf"
               class="btn btn-blue mt-3 w-100">
                Download &amp; Save QR Code
            </a>

        </div>
    </div>
    `,
};
