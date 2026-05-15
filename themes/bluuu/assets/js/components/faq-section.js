const FaqSection = {
    props: ['faq'],
    template: `
        <div>
            <div class="py-xl-5 py-4"></div>
            <div class="text-center">
                <div class="bg-white d-inline-flex py-3 px-4 rounded-2 align-items-center lh-1 shadow">
                    <div class="blue-dot rounded-1 bg-blue me-2"></div>FAQ
                </div>
                <div>
                    <h2 class="title fz-3 fw-600 lh-11 mt-4 c-950">
                        {{text.name}}
                    </h2>
                </div>
            </div>
            <div class="pt-3"></div>
            <div class="mt-5"></div>
            <div class="faq px-5 py-1 bg-white rounded-3 mt-2" v-for="f in limitedFaq" v-bind:key="f.id">
                <h3 class="question d-flex align-items-center" @click="f.active = !f.active">
                    <span class="fz-15 lh-11 fw-600 c-950 flex-grow-1 me-2" v-html="f.question"></span>
                    <div class="fz-3 expand-icon" v-bind:class="{ active: f.active }"></div>
                </h3>
                <div class="answer c-500 mt-3" v-html="f.answer" v-if="f.active"></div>
            </div>
            <div class="text-center mt-4">
                <span v-if="limit==5" class="tdu c-950 pointer c-blue-hover" v-on:click="limit=faq.length">Show more</span>
                 <span v-else class="tdu c-950 pointer c-blue-hover" v-on:click="limit=5">Hide</span>
            </div>
        </div>
    `,

    data(){
        return {
            text:{
                name: "Questions & answers"
            },
            limit: 5
        }
    },
    computed:{
        limitedFaq(){
            return this.faq.slice(0, this.limit);
        }
    }
};