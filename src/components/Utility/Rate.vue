<template>
  <h1>Vehicle {{ vehicle }} Ride {{ ride }} </h1>
  <MyImage :image_entry='{ "order": 0, "compare_vehicle": vehicle, "compare_ride": ride }' :selected_entry="false"
    :selectable_entry="false" />
  <br />
  <va-button v-on:click="sendData()" :disabled="!can_send || !user.uid">SEND</va-button>
  <br />
  <MyImage v-for="(similar_entry, index_similar_entry) in selected_similar" :image_entry='similar_entry.entry'
    :selected_entry="similar_entry.is_selected" :selectable_entry="true"
    @input="(n) => (calculateSend(index_similar_entry))" />
</template>

<script>

import { getAuth, onAuthStateChanged } from "firebase/auth";
import AllSimilar5 from '../../assets/marker_all_percent_1_5.json';
import AllSimilar10 from '../../assets/marker_all_percent_1_10.json';
import AllSimilar15 from '../../assets/marker_all_percent_1_15.json';
import AllSimilar20 from '../../assets/marker_all_percent_1_20.json';
import AllData from '../../assets/all_no_data.json'
import MyImage from './MyImage.vue';
import { ratingsRef } from "../../firebase_main.js";

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
    this.ws = split_vals[2];
    var AllSimilar = AllSimilar5;
    if (this.ws == 10) {
      AllSimilar = AllSimilar10;
    }
    if (this.ws == 15) {
      AllSimilar = AllSimilar15;
    }
    if (this.ws == 20) {
      AllSimilar = AllSimilar20;
    }
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
      ride: split_vals[1],
      ws: split_vals[2],
      can_send: false,
    };
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go();
      }
    );
  },
  methods: {
    calculateSend(index_similar_entry) {
      this.selected_similar[index_similar_entry].is_selected = !this.selected_similar[index_similar_entry].is_selected;
      this.selected_list = [];
      for (var i = 0; i < this.selected_similar.length; i++) {
        var str_start = this.selected_similar[i].entry.compare_vehicle + "_" + this.selected_similar[i].entry.compare_ride + "_" + this.selected_similar[i].entry.order;
        if (this.selected_similar[i].is_selected) {
          this.selected_list.push(str_start);
        }
      }
      if (this.selected_list.length != 5) {
        this.can_send = false;
      } else {
        this.can_send = true;
      }
    },
    sendData() {
      let me = this;
      this.found_data = false;
      ratingsRef
        .get()
        .then(function (snapshotRating) {
          snapshotRating.forEach(function (childSnapshotRating) { 
            let vehicleID = childSnapshotRating.get("vehicle");
            let rideID = childSnapshotRating.get("ride");
            let wsID = childSnapshotRating.get("ws");
            let userID = childSnapshotRating.get("userID");
            if (vehicleID == me.vehicle && rideID == me.ride && wsID == me.ws && userID == me.user.uid) {
              me.found_data = childSnapshotRating.id;
            } 
          }); 
        })
        .then(() => {
          if (me.found_data != false) {
            ratingsRef
              .doc(me.found_data)
              .set({ chosen: me.selected_list }, { merge: true })
          } else {
            ratingsRef
              .add(
                {
                  vehicle: me.vehicle,
                  ride: me.ride,
                  ws: me.ws,
                  userID: me.user.uid,
                  chosen: me.selected_list
                },
                { merge: true }
              )
          }
          me.findSmallestUnrated();
        });
    },
    findSmallestUnrated() {
      let me = this;  
      this.rated_array = [];  
      for (var ws_use = 5; ws_use < 25; ws_use += 5) {
        for (var i = 0; i < AllData.vehicles.length; i++) { 
          if (AllData.vehicles[i].vehicle < 10) {
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
              this.rated_array.push({"string_rated": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "rated_before": false});
            }
          }
        } 
        for (var i = 0; i < AllData.vehicles.length; i++) { 
          if (AllData.vehicles[i].vehicle >= 10) {
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
              this.rated_array.push({"string_rated": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "rated_before": false});
            }
          }
        }
      } 
      ratingsRef
        .get()
        .then(function (snapshotRating) {
          snapshotRating.forEach(function (childSnapshotRating) { 
            let vehicleID = childSnapshotRating.get("vehicle");
            let rideID = childSnapshotRating.get("ride");
            let wsID = childSnapshotRating.get("ws");
            let userID = childSnapshotRating.get("userID");
            if (userID == me.user.uid) {
              var string_find = vehicleID + "_" + rideID + "_" + wsID;
              for (var ix_rated = 0; ix_rated < me.rated_array.length; ix_rated += 1) {
                if (me.rated_array[ix_rated].string_rated == string_find) {
                  me.rated_array[ix_rated].rated_before = true
                }
              }
            } 
          }); 
        })
        .then(() => {
          for (var ix_rated = 0; ix_rated < me.rated_array.length; ix_rated += 1) {
            if (me.rated_array[ix_rated].rated_before == false) {
              me.$router.push("/rate/" + me.rated_array[ix_rated].string_rated); 
              break;
            }
          }
        });
    }, 
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