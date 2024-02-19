<template>
    <div>Vehicle {{ vehicles.vehicles[selected_vehicle_ix].vehicle }} Ride {{
        vehicles.vehicles[selected_vehicle_ix].rides[selected_ride_ix].ride }} </div> 
    <img :id="'my_canvas' + point_no" alt="da" width="300" />
    Vehicle <select :id="'vehicle_select' + point_no" name="vehicle_select" v-model="selected_vehicle_ix"
        v-on:change="getFile">
        <option v-for="vehicle_ix in vehicle_ix_array" :key="vehicles.vehicles[vehicle_ix].vehicle" :value="vehicle_ix">
            {{ vehicles.vehicles[vehicle_ix].vehicle }}</option>
    </select>
    Ride <select :id="'ride_select' + point_no" name="ride_select" v-model="selected_ride_ix" v-on:change="getFile">
        <option v-for="ride_ix in ride_ix_array[selected_vehicle_ix]"
            :key="vehicles.vehicles[selected_vehicle_ix].rides[ride_ix].ride" :value="ride_ix">
            {{ vehicles.vehicles[selected_vehicle_ix].rides[ride_ix].ride }}</option>
    </select>
</template>

<script>

import AllData from '../assets/all_no_data.json'

export default {
    name: "ListVehiclesPNG",
    props: ["point_no"],
    data() {
        var vehicle_ix_array = [];
        var ride_ix_array = [];
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle < 10) {
                if (AllData.vehicles[i].rides.length > 0) {
                    vehicle_ix_array.push(i);
                }
            }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle >= 10) {
                if (AllData.vehicles[i].rides.length > 0) {
                    vehicle_ix_array.push(i);
                }
            }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
            ride_ix_array.push([]);
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                ride_ix_array[ride_ix_array.length - 1].push(j);
            }
        }
        this.selected_vehicle_ix = vehicle_ix_array[0];
        this.selected_ride_ix = ride_ix_array[0][0];
        this.getFile();
        return {
            vehicles: AllData,
            selected_vehicle_ix: vehicle_ix_array[0],
            selected_ride_ix: ride_ix_array[0][0],
            vehicle_ix_array: vehicle_ix_array,
            ride_ix_array: ride_ix_array
        };
    },
    methods: {
        getFile: async function (event) {
            var str_vehicle = AllData.vehicles[this.selected_vehicle_ix].vehicle;
            var str_ride = AllData.vehicles[this.selected_vehicle_ix].rides[this.selected_ride_ix].ride;
            var file_name = "../assets/cleaned_png/" + str_vehicle + "/" + str_ride + "/" + str_vehicle + "_" + str_ride + ".png";
            var get_response = await import(file_name); 
            var c = document.getElementById('my_canvas' + this.point_no);
            c.src = get_response.default;
        }
    }
}
</script>