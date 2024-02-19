<template> 
  <div>Vehicle {{ vehicles.vehicles[selected_vehicle_ix].vehicle }} Ride {{ vehicles.vehicles[selected_vehicle_ix].rides[selected_ride_ix].ride }} Start {{ start }} Window {{ ws }}</div>
  <canvas :id="'my_canvas' + point_no" width="300" height="300"></canvas>  
  <BIcon0CircleFill v-on:click="drawTraj" />
  Vehicle <select :id="'vehicle_select' + point_no" name="vehicle_select" v-model="selected_vehicle_ix" v-on:change="getFile">
    <option v-for="vehicle_ix in vehicle_ix_array" :key="vehicles.vehicles[vehicle_ix].vehicle" :value="vehicle_ix">
      {{ vehicles.vehicles[vehicle_ix].vehicle }}</option>
  </select>
  Ride <select :id="'ride_select' + point_no" name="ride_select" v-model="selected_ride_ix" v-on:change="getFile">
    <option v-for="ride_ix in ride_ix_array[selected_vehicle_ix]"
      :key="vehicles.vehicles[selected_vehicle_ix].rides[ride_ix].ride" :value="ride_ix">
      {{ vehicles.vehicles[selected_vehicle_ix].rides[ride_ix].ride }}</option>
  </select> 
  Start <select :id="'ix_select' + point_no" name="ix_select" v-model="start">
    <option v-for="ix in ride_data" :key="ix.index" :value="ix.index">
      {{ ix.index }}</option>
  </select>
  Window <select :id="'ws_select' + point_no" name="ws_select" v-model="ws">
    <option v-for="ws_val in [5, 10, 15, 20]" :key="ws_val" :value="ws_val">
      {{ ws_val }}</option>
  </select> 
</template>

<script>

import AllData from '../assets/all_no_data.json' 

export default {
  name: "ListVehicles",
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
      start: 0,
      vehicle_ix_array: vehicle_ix_array,
      ride_ix_array: ride_ix_array,
      ws: 20,
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
      if (this.ride_data.length <= this.start) {
        this.start = 0;
      }
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
      var xvals_short = this.xvals.slice(this.start, Math.min(this.xvals.length, this.start + this.ws));
      var yvals_short = this.yvals.slice(this.start, Math.min(this.yvals.length, this.start + this.ws));
      var transformed_vals = this.transform(xvals_short, yvals_short); 
      xvals_short = transformed_vals[0];
      yvals_short = transformed_vals[1];
      var xrange = Math.max(...xvals_short) - Math.min(...xvals_short);
      var yrange = Math.max(...yvals_short) - Math.min(...yvals_short);  
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
      for (var i = 0; i < xvals_short.length - 1; i++) {
        ctx.moveTo((xvals_short[i] - Math.min(...xvals_short)) / xrange * x_scaling_factor, c.height - (yvals_short[i] - Math.min(...yvals_short)) / yrange * y_scaling_factor);
        ctx.lineTo((xvals_short[i + 1] - Math.min(...xvals_short)) / xrange * x_scaling_factor, c.height - (yvals_short[i + 1] - Math.min(...yvals_short)) / yrange * y_scaling_factor);
      }
      ctx.stroke();  
    },
    transform: function (longs, lats) {
      let long_diff = longs.map((value, i) => value - longs[0]);
      let lat_diff = lats.map((value, i) => value - lats[0]); 

      let angle_all = [];
      let radius_all = [];
      for (let i = 1; i < long_diff.length; i++) {
          radius_all.push(Math.sqrt(lat_diff[i] ** 2 + long_diff[i] ** 2));
          angle_all.push(Math.atan2(lat_diff[i], long_diff[i]));
      }

      let long_new = radius_all.map((value, i) => value * Math.cos(angle_all[i] - angle_all.slice(-1)[0]));
      let lat_new = radius_all.map((value, i) => value * Math.sin(angle_all[i] - angle_all.slice(-1)[0]));

      long_new.unshift(0);
      lat_new.unshift(0);

      let x_dir = long_new[0] < long_new[1];
      let y_dir = lat_new[0] < lat_new[1];

      let long_new2 = long_new.map(x => x - Math.min(...long_new));
      let lat_new2 = lat_new.map(y => y - Math.min(...lat_new));

      if (!x_dir) {
          long_new2 = long_new2.map(x => Math.max(...long_new2) - x);
      }

      if (!y_dir) {
          lat_new2 = lat_new2.map(y => Math.max(...lat_new2) - y);
      }

      return [long_new2, lat_new2];
    }
  }  
}
</script>