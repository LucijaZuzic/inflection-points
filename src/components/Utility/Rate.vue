<template>
  <div>Vehicle {{ vehicle }} Ride {{ ride }} </div>
  {{ selected_similar }}
  <MyImage :image_entry='{ "position": 0, "compare_vehicle": vehicle, "compare_ride": ride }' :selected_entry="false" :selectable_entry="false" />
  <br />
  <MyImage v-for="(similar_entry, index_similar_entry) in selected_similar" :image_entry='similar_entry.entry'
    :selected_entry="similar_entry.is_selected" :selectable_entry="true"
    @input="(n) => (selected_similar[index_similar_entry].is_selected = !selected_similar[index_similar_entry].is_selected)" />
</template>

<script>

import { getAuth, onAuthStateChanged } from "firebase/auth";
import AllSimilar from '../../assets/marker_all_percent_1_5.json'
import MyImage from './MyImage.vue'

export default {
  components: {
    MyImage
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.user = user;
        // ...
      } else {
        // User is signed out
        // ...
      }
      return true;
    });
  },
  data() {
    let combined = this.$route.params.combined;
    let split_vals = combined.split("_");
    this.vehicle = split_vals[0];
    this.ride = split_vals[1];
    let similar_get = [];
    for (var i = 0; i < AllSimilar.compare_to.length; i++) {
      let some_ride = AllSimilar.compare_to[i];
      if (some_ride.vehicle == this.vehicle && some_ride.ride == this.ride) {
        similar_get = some_ride.similar
      }
    }
    this.file_name = "/public/cleaned_png/" + this.vehicle + "/" + this.ride + "/" + this.vehicle + "_" + this.ride + ".png";
    var shuffle_me = this.shuffle([...similar_get]);
    var selected_vals = [];
    for (var i = 0; i < shuffle_me.length; i++) {
      selected_vals.push({ "entry": shuffle_me[i], "is_selected": false })
    }
    return {
      selected_similar: selected_vals,
      similar: similar_get,
      similar_shuffled: shuffle_me,
      vehicle: split_vals[0],
      ride: split_vals[1]
    };
  },
  methods: {
    shuffle(array) {
      let currentIndex = array.length, randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    }
  }
}
</script>