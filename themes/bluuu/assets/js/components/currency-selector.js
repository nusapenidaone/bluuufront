const CurrencySelector = {
    props: ['rates'],
    inject: ['order'],
    data() {
        return {
            languages: [
              { code: "en", name: "English" },
              { code: "es", name: "Español" },
              { code: "de", name: "Deutsch" },
              { code: "fr", name: "Français" },
              { code: "pt", name: "Português" },
              { code: "ru", name: "Русский" },
              { code: "id", name: "Bahasa Indonesia" },
              { code: "hi", name: "हिन्दी" },
              { code: "ar", name: "العربية" },
              { code: "bn", name: "বাংলা" },
              { code: "ja", name: "日本語" }
            ],
            active: 1
        }
    },
    mounted() {
        const gScript = document.createElement("script");
        gScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";


        document.body.appendChild(gScript);
        window.googleTranslateInit = () => {
            new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    autoDisplay: false,
                },
                "translate"
            );
        };
        const lang = localStorage.getItem('language') || 'en';
        if (lang != 'en') {
            this.order.language = lang;
            this.doGTranslate(lang);
        }
        const saved = localStorage.getItem('currency') || 'USD';
        this.order.currency = saved;
        const rateObj = this.rates.find(el => el.code === saved);
        if (rateObj) {
            this.order.rate = rateObj.rate;
        }
    },
    methods: {
        fireEvent(element, event) {
            try {
                if (document.createEventObject) {
                    const evt = document.createEventObject();
                    element.fireEvent("on" + event, evt);
                } else {
                    const evt = document.createEvent("HTMLEvents");
                    evt.initEvent(event, true, true);
                    element.dispatchEvent(evt);
                }
            } catch (e) {}
        },
        doGTranslate(lang) {
            localStorage.setItem('language', lang);
            this.order.language = lang;
            let teCombo;
            const sel = document.getElementsByTagName("select");

            for (let i = 0; i < sel.length; i++) {
                if (sel[i].className.indexOf("goog-te-combo") !== -1) {
                    teCombo = sel[i];
                    break;
                }
            }
            if (!teCombo || teCombo.length === 0) {
                setTimeout(() => {
                    this.doGTranslate(lang);
                }, 500);
            } else {
                teCombo.value = lang;
                this.fireEvent(teCombo, "change");
                this.fireEvent(teCombo, "change");
            }
        },
        setCurrency(r) {
            this.order.currency = r.code;
            this.order.rate = r.rate;
            localStorage.setItem('currency', r.code);
        }
    },
    template: `
        <div class="popup-small bg-white p-1 rounded-15" id="currency-popup">
            <div id="translate" style="display:none"></div>
            <div class="d-flex c-950 fz-12 fw-600">
                <span class="pb-3 pointer" v-on:click="active=1" v-bind:class="{'c-blue' : active==1}">Language</span>
                <span class="ms-3 pb-3 pointer" v-on:click="active=2" v-bind:class="{'c-blue' : active==2}">Currency</span>
            </div>
            <div class="h-1 mb-3 bg-black-10"></div>
            <div class="row notranslate" v-if="active==1">
                <div class="col-12" v-for="l in languages">
                    <div class="c-950 fw-600 pointer py-2 c-blue-hover" v-bind:key="l.id" v-on:click="doGTranslate(l.code)" data-fancybox-close>
                        <span class="fw-600" v-text="l.name"></span>&nbsp;-&nbsp;<span v-text="l.code" class="ttu"></span>
                    </div>
                </div>
            </div>
            <div class="row notranslate" v-else>
                <div class="col-12" v-for="r in rates">
                    <div class="c-950 fw-600 pointer py-2 c-blue-hover" v-bind:key="r.id" @click="setCurrency(r)" data-fancybox-close>
                        <span class="fw-600" v-text="r.name"></span>&nbsp;-&nbsp;<span v-text="r.code"></span>
                    </div>
                </div>
            </div>
        </div>
    `
};