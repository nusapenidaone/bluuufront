const LogosSlider = {

    template: `
    <div class="logos-slider splide" role="group" aria-label="logos slider" ref="logosSlider" >
        <div class="splide__track">
            <ul class="splide__list">
                <li v-for="s in 9" class="splide__slide"><img v-bind:src="'/themes/bluuu/assets/images/logo0'+s+'.webp'" alt="partner logo" class="h-100" loading="lazy"></li>
            </ul>
        </div>
    </div>
    `,
     data() {
            return {
                slider: null
            }
     },
    mounted() {
        this.slider= new Splide(this.$refs.logosSlider, {
            arrows: false,
            type: "loop",
            drag: "free",
            focus: "center",
            gap: "4rem",
            height: "3.5rem",
            autoWidth: true,
            pagination: false,
            autoScroll: {
                speed: 0.5,
            },
            breakpoints: {
                768: {
                    gap: "2.5rem",
                    height: "3rem"
                },
                480: {
                    gap: "2rem",
                    height: "2.5rem"
                },
            },
        }).mount( window.splide.Extensions );
    },

};


