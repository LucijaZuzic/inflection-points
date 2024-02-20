<template>
    <div style="display: inline-block; vertical-align: top; text-align: left; width: 25%;"
        v-on:click="my_selected = !my_selected; $emit('input', my_selected)">
        <va-icon name="done" v-if="my_selectable" :color="color_compute" style="border: none" />
        <img width="100%" :src='"/cleaned_png/" + my_vehicle + "/" + my_ride + "/" + my_vehicle + "_" + my_ride + ".png"' />
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
    computed: {
        color_compute: function () {
            if (this.my_selected) {
                return "success";
            } else {
                return "danger";
            }
        }
    }
};
</script>