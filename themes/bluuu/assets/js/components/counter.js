const Counter = {
    template: `
        <div class="text-center bg-orange-50 p-2 c-950 ">
            <div class="container-xl">
                Please complete your reservation within&nbsp;
                <b class="fw-600">{{ formattedTime }}</b>
            </div>
        </div>
    `,
    data() {
        return {
            counter: null,
            seconds: 600,
        }
    },
    mounted() {
        this.startCounter();
    },
    methods: {
        startCounter() {
            this.counter = setInterval(() => {
                if (this.seconds > 0) {
                    this.seconds--;
                } else {
                    clearInterval(this.counter);
                    this.seconds = 0;

                    Fancybox.show(
                        [
                            {
                                html: `<div class="text-center fz-15 p-1 rounded-1 c-950">
                                           Time is up, the page will reload...
                                       </div>`,
                            },
                        ],
                        {
                            closeButton: false,
                            dragToClose: false,
                            click: false,
                        }
                    );

                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                }
            }, 1000);
        },
    },
    computed: {
        formattedTime() {
            const minutes = Math.floor(this.seconds / 60);
            const secs = this.seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
    },
    beforeUnmount() {
        clearInterval(this.counter);
    }
}
