<template>
  <ListVehiclesPNG :point_no="1" />
  <ListVehiclesPNG :point_no="2" />
</template>

<script>
import ListVehiclesPNG from './components/ListVehiclesPNG.vue'

export default {
  name: 'App',
  components: { ListVehiclesPNG }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>