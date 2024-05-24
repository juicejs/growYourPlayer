Vue.use(VuePromiseBtn);

const app = new Vue({
    el: '#main',
    components: {
        playerBid: httpVueLoader('/vue/playerModalBid.vue'),
        playerShared: httpVueLoader('/vue/playerModalShared.vue'),
        playerShared2: httpVueLoader('/vue/playerModalShared2.vue')
    },
    data() {
        return {}
    },
    beforeMount() {
        window.openDetails = (id, type) => { this.show(id, type) };
    },
    methods: {
        show(id, type) {
            if (type == 'bid')
                this.$refs.playerBid.show(id);
            if (type == 'shared')
                this.$refs.playerShared.show(id);
            if (type == 'shared2')
                this.$refs.playerShared2.show(id);
        }

    }
});
