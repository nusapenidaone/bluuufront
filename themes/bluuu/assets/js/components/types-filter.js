const TypesFilter={
    props: ['types'],
    inject: ['order'],
    template:`
    <div id="typesfilter" class="bottom-popup popup-small bg-white p-1 rounded-1 order-lg-0 order-1">
        <div class="fw-600 c-950 fz-12 text-center">Select tour type</div>
        <div class="p-4 d-flex align-items-center bg-100 border-black-10 rounded-1 mt-3 bg-blue-50-hover pointer" data-fancybox-close v-on:click="order.selectedType=null">
        <span class="ms-2">All Tours</span>
        </div>
        <template v-for="type in types" :key="type.id">
        
        <div class="p-4 d-flex align-items-center bg-100 border-black-10 rounded-1 mt-3 bg-blue-50-hover pointer" data-fancybox-close v-on:click="order.selectedType=type">
        <i class="fz-15" :class="type.slug+'-icon'"></i><span class="ms-2">{{type.name}}</span>
        </div>
        </template>
        
    </div>
    `,

}



