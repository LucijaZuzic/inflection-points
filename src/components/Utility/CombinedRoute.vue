<template>
    <router-link v-bind:to="{ name: 'rate', params: { combined: cr } }"> 
        <va-button outline :rounded="false" style="border: none" color="success" v-if="sr">
            <va-icon name="done" color="success" />
        </va-button>
        <va-button outline :rounded="false" style="border: none" color="danger" v-else >
            <va-icon name="close" color="danger" />
        </va-button>
    </router-link>
</template>

<script>
export default {
    props: ["combined_route", "status_route"],
    emits: ["input"],
    data() { 
        this.cr = this.$props.combined_route;
        this.sr = this.$props.status_route;
        return { 
        };
    },  
};
</script>