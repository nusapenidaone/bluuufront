const PromoCode = {
    props: ['code'],
    template: `
        <div class="top-banner py-2 c-200 bg-950 fz-08 lh-15 position-relative z-1">
            <div class="container-fluid px-10 text-center py-2">
                <span>Paradise is even sweeter when it’s on sale. Use code</span>
                
                <span class="bg-900 rounded-1 promocode d-inline mx-2 pointer bg-blue-hover" @click="copy(code)">
                <template v-if="!copied">{{code}} <i class="copy-icon-white fz-13"></i></template>
                <template v-else> Copied</template>
                </span>
                <span>to snag a discount on your booking. Hurry, this offer is as fleeting as a Bali sunset!</span>
                <i class="close-icon-white"></i>
            </div>
        </div>
  `,
    data(){
        return {
            copied: false
        }
    },
    methods: {
        copy(c) {
            const tempInput = document.createElement("input");
            tempInput.value = c;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            this.copied=true
        }
    },
};