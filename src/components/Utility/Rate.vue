<template>

  <body class="my_body">
    <LoadingBar v-if="!fully_loaded"></LoadingBar>
    <span v-else>
      <h4 class="display-4">
        <va-icon size="large" name="pending"></va-icon>
        &nbsp;
        Progress &nbsp; {{ my_index }} / {{ rated_array.length }}
        &nbsp;
        <va-button v-on:click="sendData()" :rounded="false" style="height: 100%; border: none;"
          :disabled="!can_send || !user">Send</va-button>
        &nbsp;
        <va-button @click="$refs.description.show()" icon="info" :rounded="false" style="border: none"> Help
        </va-button>
        <va-modal :mobile-fullscreen="false" ref="description" hide-default-actions stateful>
          <Info></Info>
          <br />
          <va-button @click="$refs.description.hide()" :rounded="false" style="border: none"> OK
          </va-button>
        </va-modal>
      </h4>
      <br /> 
      <div>
        <div>
          <MyImage :image_entry='{ "order": 0, "compare_vehicle": vehicle, "compare_ride": ride }'
            :selected_entry="false" :selectable_entry="false" />
        </div>
        <br />
        <MyImage
          :key="selected_similar[index_similar_entry].entry.vehicle + '_' + selected_similar[index_similar_entry].entry.ride + '_' + selected_similar[index_similar_entry].entry.order + '_' + selected_similar[index_similar_entry].is_selected"
          v-for="(similar_entry, index_similar_entry) in selected_similar"
          :image_entry='selected_similar[index_similar_entry].entry'
          :selected_entry="selected_similar[index_similar_entry].is_selected" :selectable_entry="true"
          @input="(n) => (calculateSend(index_similar_entry))" />
      </div>
    </span>
  </body>
</template>

<script>

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usersRef, ratingsRef } from "../../firebase_main.js";
import AllSimilar20 from '../../assets/marker_all_percent_1_20.json';
import AllData from '../../assets/all_no_data_short.json';
import MyImage from './MyImage.vue';
import LoadingBar from "./LoadingBar.vue";
import Info from "../Utility/Info.vue";

export default {
  components: {
    MyImage,
    LoadingBar,
    Info
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
      if (!this.user) {
        this.$router.push("/login");
      } else {
        this.getIndex();
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
    var AllSimilar = AllSimilar20;
    let similar_get = [];
    for (var i = 0; i < AllSimilar.compare_to.length; i++) {
      let some_ride = AllSimilar.compare_to[i];
      if (some_ride.vehicle == this.vehicle && some_ride.ride == this.ride) {
        similar_get = some_ride.similar;
        break;
      }
    }
    this.file_name = "/public/cleaned_png/" + this.vehicle + "/" + this.ride + "/" + this.vehicle + "_" + this.ride + ".png";
    var shuffle_me = this.shuffle([...similar_get]);
    var selected_vals = [];
    for (var i = 0; i < shuffle_me.length; i++) {
      selected_vals.push({ "entry": shuffle_me[i], "is_selected": false })
    }
    return {
      my_index: -1,
      fully_loaded: false,
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
              .then(() => {
                me.findNextUnrated();
              })
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
              .then(() => {
                me.findNextUnrated();
              })
          }

        });
    },
    generateArray() {
      this.rated_array = [];
      for (var ws_use = 20; ws_use < 25; ws_use += 5) {
        for (var i = 0; i < AllData.vehicles.length; i++) {
          if (AllData.vehicles[i].vehicle < 10) {
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
              this.rated_array.push({ "string_rated": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "rated_before": false });
            }
          }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
          if (AllData.vehicles[i].vehicle >= 10) {
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
              this.rated_array.push({ "string_rated": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "rated_before": false });
            }
          }
        }
      }
    },
    balancedLatinSquare(array, participantId) {
      var result = [];
      // Based on "Bradley, J. V. Complete counterbalancing of immediate sequential effects in a Latin square design. J. Amer. Statist. Ass.,.1958, 53, 525-528. "
      for (var i = 0, j = 0, h = 0; i < array.length; ++i) {
        var val = 0;
        if (i < 2 || i % 2 != 0) {
          val = j++;
        } else {
          val = array.length - h - 1;
          ++h;
        }

        var idx = (val + participantId) % array.length;
        result.push(array[idx]);
      }

      if (array.length % 2 != 0 && participantId % 2 != 0) {
        result = result.reverse();
      }

      return result;
    },
    getIndex() {
      let me = this;
      me.generateArray();
      me.my_index = -1;
      me.fully_loaded = false;
      if (me.user) {
        usersRef
          .get()
          .then(function (snapshotUser) {
            snapshotUser.forEach(function (childSnapshotUser) {
              let user_email = childSnapshotUser.get("email");
              let user_class = childSnapshotUser.get("class");
              if (user_email == me.user.email) {
                me.user_class = user_class;
              }
            })
          }).then(() => {
            if (me.user_class) {
              var url_array = [];
              for (var ix_rated = 0; ix_rated < me.rated_array.length; ix_rated += 1) {
                url_array.push("/rate/" + me.rated_array[ix_rated].string_rated);
              }
              url_array = [...url_array].sort((a, b) => a - b);
              var bls = me.balancedLatinSquare(url_array, me.user_class - 1);
              var string_find = "/rate/" + me.vehicle + "_" + me.ride + "_" + me.ws;
              for (var ix_rated = 0; ix_rated < bls.length; ix_rated += 1) {
                if (bls[ix_rated] == string_find) {
                  me.my_index = ix_rated + 1;
                  me.fully_loaded = true;
                }
              }
            }
          })
      }
    },
    findNextUnrated() {
      let me = this;
      me.generateArray();
      if (me.user) {
        usersRef
          .get()
          .then(function (snapshotUser) {
            snapshotUser.forEach(function (childSnapshotUser) {
              let user_email = childSnapshotUser.get("email");
              let user_class = childSnapshotUser.get("class");
              if (user_email == me.user.email) {
                me.user_class = user_class;
              }
            })
          }).then(() => {
            if (me.user_class) {
              var url_array = [];
              for (var ix_rated = 0; ix_rated < me.rated_array.length; ix_rated += 1) {
                url_array.push("/rate/" + me.rated_array[ix_rated].string_rated);
              }
              url_array = [...url_array].sort((a, b) => a - b);
              var bls = me.balancedLatinSquare(url_array, me.user_class - 1);
              var string_find = "/rate/" + me.vehicle + "_" + me.ride + "_" + me.ws;
              var next_ix = 0;
              for (var ix_rated = 0; ix_rated < bls.length; ix_rated += 1) {
                if (bls[ix_rated] == string_find) {
                  next_ix = ix_rated + 1;
                  if (next_ix == bls.length) {
                    next_ix = 0;
                  }
                  break;
                }
              }
              if (next_ix == 0) {
                me.$router.push("/profile/" + me.user.email);
              } else {
                me.$router.push(bls[next_ix]);
              }
            } else {
              me.$router.push("/profile/" + me.user.email);
            }
          })
      } else {
        me.$router.push("/login");
      }
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