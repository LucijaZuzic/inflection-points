<template>
    <div>Vehicle {{ vehicles.vehicles[selected_vehicle_ix].vehicle }} Ride {{
        vehicles.vehicles[selected_vehicle_ix].rides[selected_ride_ix].ride }} </div>
    <canvas :id="'my_canvas' + point_no" width="300" height="300"></canvas>
    <BIcon0CircleFill v-on:click="drawTraj" />
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
    name: "ListVehiclesWhole",
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
            ride_ix_array: ride_ix_array,
            ride_data: [],
            xvals: [],
            yvals: []
        };
    },
    methods: {
        getFile: async function (event) {
            var str_vehicle = AllData.vehicles[this.selected_vehicle_ix].vehicle;
            var str_ride = AllData.vehicles[this.selected_vehicle_ix].rides[this.selected_ride_ix].ride;
            var file_name = '../assets/cleaned_json/' + str_vehicle + '/' + str_ride + '/' + str_vehicle + '_' + str_ride + '.json';
            var get_response = await import(file_name);
            this.ride_data = get_response.vehicles[0].rides[0].data;
            this.xvals = [];
            this.yvals = [];
            for (var i = 0; i < this.ride_data.length; i++) {
                this.xvals.push(this.ride_data[i].longitude);
                this.yvals.push(this.ride_data[i].latitude);
            }
        },
        drawTraj: function (event) {
            var c = document.getElementById('my_canvas' + this.point_no);
            var ctx = c.getContext("2d");
            var xrange = Math.max(...this.xvals) - Math.min(...this.xvals);
            var yrange = Math.max(...this.yvals) - Math.min(...this.yvals);
            c.width = 300;
            c.height = 300;
            if (xrange < yrange) {
                var y_scaling_factor = 1 * c.height;
                var x_scaling_factor = xrange / yrange * c.height;
            } else {
                var x_scaling_factor = 1 * c.width;
                var y_scaling_factor = yrange / xrange * c.width;
            }
            ctx.strokeStyle = '#00ff00';
            for (var i = 0; i < this.xvals.length - 1; i++) {
                ctx.moveTo((this.xvals[i] - Math.min(...this.xvals)) / xrange * x_scaling_factor, c.height - (this.yvals[i] - Math.min(...this.yvals)) / yrange * y_scaling_factor);
                ctx.lineTo((this.xvals[i + 1] - Math.min(...this.xvals)) / xrange * x_scaling_factor, c.height - (this.yvals[i + 1] - Math.min(...this.yvals)) / yrange * y_scaling_factor);
            }
            ctx.stroke();
        },
    }
}
</script>