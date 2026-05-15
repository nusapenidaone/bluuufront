const AbSlider = {
    template: `
        <div>
            <div class="py-xl-5 py-4"></div>
            <div class="row justify-content-center">
            <div class="col-xl-8 text-center">
            <div>
            <div class="title fz-3 fw-600 lh-11 c-950">
            Others vs DayTripBali –<br>
            <span class="c-600">see the difference!</span>
            </div>
            </div>
            <div class="fz-12 c-500 mt-4">
            Experience Bali’s ultimate island escape on a private yacht tour to Nusa Penida. Enjoy a full day of snorkeling, beach hopping, and sightseeing tailored just for you – no crowds, no rush. Relax with your friends or family on a luxury boat with captain and crew at your service.
            </div>
            </div>
            </div>
            <div class="mt-5 pt-2"></div>
            <div id="abSlider" class="rounded-3 afterbefore oh"></div>
        </div>
  `,

    mounted() {
        new SliderBar({
            el: '#abSlider',
            beforeImg: '/themes/bluuu/assets/img/tour-before.webp',
            afterImg: '/themes/bluuu/assets/img/tour-after.webp',
            line: false,
        });
    },
};