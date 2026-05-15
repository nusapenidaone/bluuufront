const Faq={
    props: ['faq'],
    template: `
       <div class="h-1 bg-black-10 my-1"></div>
        <div>
            <div class="title fz-15 fw-600 lh-11 c-950">
                {{text.name}}
            </div>
        </div>
        <div class="mt-5"></div>
        <template v-for="f in limitedFaq" v-bind:key="f.id">
            <div class="faq mt-4">
                <div class="question d-flex align-items-center" v-on:click="f.active = !f.active">
                    <span class="lh-11 fw-600 c-950 flex-grow-1 me-2" v-html="f.question"></span>
                    <div class="fz-2 expand-icon rounded" v-bind:class="{ active: f.active }"></div>
                </div>
                <div class="row">
                    <div class="col-xl-10">
                        <div class="answer c-500 mt-2" v-html="f.answer" v-if="f.active"></div>
                    </div>
                </div>
            </div>
        </template>

        <div class="text-center mt-4">
        <span v-if="limit==5" class="tdu c-950 pointer c-blue-hover" v-on:click="limit=faq.length">Show more</span>
         <span v-else class="tdu c-950 pointer c-blue-hover" v-on:click="limit=5">Hide</span>
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

}