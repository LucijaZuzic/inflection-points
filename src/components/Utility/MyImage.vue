<template>
    <div width="150" height="150">
        <img width="150" height="150" object-fit="contain" :src='"/cleaned_png/" + my_vehicle + "/" + my_ride + "/" + my_vehicle + "_" + my_ride + ".png"' />
        <br />
        <va-chip v-if="my_selectable" :outline="my_selected" style="border: none" v-on:click="my_selected = !my_selected; $emit('input', my_selected)"> 
            &nbsp;
        </va-chip>
    </div>
</template>

<script>
export default {
    props: ["image_entry", "selected_entry", "selectable_entry"],
    emits: ["input"],
    data() {
        var my_entry = this.$props.image_entry;
        var image_selected = this.$props.selected_entry;
        var image_selectable = this.$props.selectable_entry;
        return {
            my_vehicle: my_entry.compare_vehicle,
            my_ride: my_entry.compare_ride,
            my_selected: image_selected,
            my_selectable: image_selectable,
        };
    },
    methods: {
        changeSelected() {

        }
    }
};
</script> 