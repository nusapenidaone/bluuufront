const FormatDate = {
    props: ['date'],
    computed: {
        formatDate() {
            if (!this.date) return 'Select date';
            const [year, month, day] = this.date.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            return d.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
        }
    },
    template: `<span>{{ formatDate }}</span>`
};


const PrevDate = {
    props: ['date'],
    computed: {
        prevDate() {
            if (!this.date) return 'Select date';
            const [year, month, day] = this.date.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            d.setDate(d.getDate() - 1);
            return d.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
        }
    },
    template: `<span>{{ prevDate }}</span>`
};




