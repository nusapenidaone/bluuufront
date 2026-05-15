const ContactDetails={
    props: ['rules','tour'],
    inject: ['order'],
    template:`
        <div class="p-xl-1 p-4 border-black-10 bg50 rounded-1 mb-3 bg-white">
            <div class="d-flex fz-12 pointer">
                <div class="fw-600 flex-grow-1">
                    <span v-if="order.partner!=false">{{text.name}}</span>
                    <span v-else>{{text.name1}}</span>
                </div>
            </div>
            <div class="fz-09 c-500">{{text.description}}</div>
            <Transition>
                <div v-if="order.payStep==3">
                    <div class="h-1 bg-black-10 my-3"></div>
                    <div class="mt-4">
                        <div class="mb-2 ms-2">Name<span class="c-orange">*</span></div>
                        <div>
                            <input class="input" type="text" v-model="order.name" placeholder="Enter your full name">
                        </div>
                        <div class="c-red fz-08 ms-2" v-if="!validateName">Name is required. Only letters, minimum 3 characters.</div>
                    </div>
                    <div class="mt-4">
                        <div class="mb-2 ms-2">Email<span class="c-orange">*</span></div>
                        <div>
                            <input class="input" type="email" v-model="order.email" placeholder="Enter your email address">
                        </div>
                        <div class="c-red fz-08 ms-2" v-if="!validateEmail">Email is required. Must be a valid email address.</div>
                    </div>
                    <div class="mt-4">
                        <div class="mb-2 ms-2">Whatsapp Number<span class="c-orange">*</span></div>
                        <div>
                            <input class="input" type="tel" v-model="order.whatsapp" placeholder="Whatsapp Number with Country Code">
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="mb-2 ms-2">Any special requests?</div>
                        <div>
                            <textarea class="input" name="order.requests" rows="4" placeholder="Write your comments here"></textarea>
                        </div>
                    </div>
                    <div class="agree-block pointer mt-4" data-fancybox data-src="#agree">
                        <div class="d-flex mt-3"> <i class="checkbox-button fz-15 align-self-center" v-bind:class="{ active: agree }"></i> <span class="c-500 ms-2">I agree with terms of Privacy Policy and Cancelation Policy</span></div>
                        <div class="d-flex mt-3"> <i class="checkbox-button fz-15 align-self-center" v-bind:class="{ active: agree }"></i> <span class="c-500 ms-2">I consent to the Release from liability</span></div>
                        <div class="c-red fz-08 ms-2 mt-2" v-if="!validateAgree">You must agree to the terms and release from liability.</div>
                    </div>
                    <div class="c-500 pointer tdu mt-3" data-fancybox data-src="#health">Health & Safety Procedures, and Sustainability Policy</div>
                    <div class="h-1 bg-black-10 my-3"></div>
                    <div class="row flex-row-reverse">
                        <div class="col-auto">
                            <button class="btn btn-orange" v-on:click="sendOrder" v-if="!loading">
                                <span v-if="tour.partner==true">Send request</span>
                                <span v-else>Make a payment</span>
                            </button>
                            <button class="btn btn-light" disabled v-else>
                                <span class="me-2">Please wait </span>
                                <span class="preloading1">·</span>
                                <span class="preloading2">·</span>
                                <span class="preloading3">·</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        <Teleport to="body">
            <template>
                <div id="agree" class="popup-large bg-white p-xl-1 p-4 rounded-15">
                    <div style="height:80vh" class="bg-50 oy-auto border-black-10 rounded-1">
                        <div class="p-4">
                            <div>
                                <div class="c-950 fw-600 fz-12" v-text="rules.privacy.title"></div>
                                <div class="mt-3 content" v-html="rules.privacy.text"></div>
                            </div>
                            <div class="mt-5">
                                <div class="c-950 fw-600 fz-12">Cancelation policy</div>
                                <div class="mt-3 content" v-html="tour.cancelation.text"></div>
                            </div>
                            <div class="mt-5">
                                <div class="c-950 fw-600 fz-12" v-text="rules.release.title"></div>
                                <div class="mt-3 content" v-html="rules.release.text"></div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex mt-3 pointer" v-on:click="agree=!agree" data-fancybox-close>
                        <i class="checkbox-button fz-15 align-self-center" v-bind:class="{ active: agree }"></i> <span class="c-500 ms-2">I agree with terms of Privacy Policyand Cancelation Policy, I consent to the Release from liability</span>
                    </div>
                </div>
                <div id="health" class="popup-large bg-white p-xl-1 p-4 rounded-15">
                    <div class="c-950 fw-600 fz-12" v-html="rules.health.title"></div>
                    <div class="mt-3" v-html="rules.health.text"></div>
                </div>
            </template>
        </Teleport>
    `,
    data(){
        return{

        text:{
            name: "3 Contact details",
            name1: "Contact details",
            description: "Enter your contact details"
        },
           validate: false,
           agree: false,
           loading: false
        }
    },

    computed:{
        validateEmail() {
            if(!this.validate) return true;
			const regex = /^[a-zA-Z0-9._-]+[a-zA-Z0-9_-]@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			return regex.test(this.order.email);
		},
        validateName() {
          if(!this.validate) return true;
          const regex = /^[A-Za-zА-Яа-яЁё\s]{3,}$/;
          const name = this.order.name.trim();
          return regex.test(name);
        },
        validateAgree(){
            if(!this.validate) return true;
            if(this.agree) return true;
        }, 

    },
    methods:{
        sendOrder(){
            this.validate=true;
            if(!this.validateEmail || !this.validateName || !this.validateAgree) {
                return false;
            }
            this.loading=true
            
              axios.post('/api/order', this.order, {
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
    }
}