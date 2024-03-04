<template>
    <va-card :color="color_compute"
        style="padding: 5px; margin: 5px; display: inline-block; vertical-align: top; text-align: left; width: 18%; max-width: 200px"
        v-on:click="checkSelect()">
        <va-image :ratio="1" :id="my_vehicle + '/' + my_ride"
            :src="'/cleaned_png/' + my_vehicle + '/' + my_ride + '/' + my_vehicle + '_' + my_ride + '.png'"></va-image>
    </va-card>
</template>

<script>
export default {
    props: ["image_entry", "selected_entry", "selectable_entry", "use_color"],
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
        checkSelect: function () {
            if (this.my_selectable) {
                this.my_selected = !this.my_selected;
                this.$emit('input', this.my_selected);
            }
        }
    },
    computed: {
        color_compute: function () {
            if (!this.my_selectable) {
                if (!this.use_color) {
                    return "primary";
                } else {
                    if (this.my_selected) {
                        return "success";
                    } else {
                        return "danger";
                    }
                }
            }
            if (this.my_selected) {
                return "success";
            } else {
                return "danger";
            }
        }
    }
};
</script>