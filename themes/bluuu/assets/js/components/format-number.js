const FormatNumber = {
    props: ['number'],
    inject: ['order'],
    computed: {
        formatNumber() {
            const isNegative = this.number < 0;
            const amount = Math.abs(this.number * this.order.rate);
            let formatted;
            if (this.order.currency.toLowerCase() === 'idr') {
                formatted = Math.floor(amount)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            } else {
                formatted = amount
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
            let result = isNegative ? '-' : '';
            result += formatted;
            return result;
        }
    },
    template: `
    <span key="formatNumber" class="notranslate text-nowrap">{{ formatNumber }}&nbsp;{{ order.currency.toUpperCase() }}</span>
    `
};
