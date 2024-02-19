<template>
  <div>
    <div>Vehicle {{ vehicle }} Ride {{ ride }} Start {{ start }} Window {{ ws }}</div>
    <canvas :id="'mycanvas' + point_no" width="300" height="300"></canvas>
    <BIcon0CircleFill v-on:click="getFile" />
  </div>
</template>

<script>
import { BIcon0CircleFill } from 'bootstrap-icons-vue';

export default {
  name: "LineChart",
  props: ["point_no", "ws", "start", "vehicle", "ride"],
  methods: {
    getFile: async function (event) {
      var file_name = '../assets/cleaned_json/' + this.vehicle.toString() + '/' + this.ride.toString() + '/' + this.vehicle.toString() + '_' + this.ride.toString() + '.json';
      var get_response = await import(file_name);
      this.ride_data = get_response.vehicles[0].rides[0].data;
      this.xvals = [];
      this.yvals = [];
      for (var i = 0; i < this.ride_data.length; i++) {
        this.xvals.push(this.ride_data[i].longitude);
        this.yvals.push(this.ride_data[i].latitude);
      } 
      var c = document.getElementById('mycanvas' + this.point_no);
      var ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height); 
      var xvals_short = this.xvals.slice(this.start, Math.min(this.xvals.length, this.start + this.ws));
      var yvals_short = this.yvals.slice(this.start, Math.min(this.yvals.length, this.start + this.ws));
      var xrange = Math.max(...xvals_short) - Math.min(...xvals_short);
      var yrange = Math.max(...yvals_short) - Math.min(...yvals_short); 
      for (var i = 0; i < xvals_short.length - 1; i++) {
        ctx.moveTo((xvals_short[i] - Math.min(...xvals_short)) / xrange * c.width, (yvals_short[i] - Math.min(...yvals_short)) / yrange * c.height);
        ctx.lineTo((xvals_short[i + 1] - Math.min(...xvals_short)) / xrange * c.width, (yvals_short[i + 1] - Math.min(...yvals_short)) / yrange * c.height);
      }
      ctx.stroke();
    }
  },
  components: { BIcon0CircleFill }
}
</script>