<script>
import MyImage from './MyImage.vue';
import AllSimilar20 from '../../assets/marker_all_percent_1_20.json';

export default {
  components: {
    MyImage
  },
  data() {
    var AllSimilar = AllSimilar20;
    let similar_get = [];
    for (var i = 0; i < AllSimilar.compare_to.length; i++) {
      let some_ride = AllSimilar.compare_to[i];
      if (some_ride.vehicle == 1 && some_ride.ride == 4595074) {
        similar_get = some_ride.similar;
        break;
      }
    }
    return {
      selected_similar: similar_get,
      fully_loaded: true,
    };
  },
};
</script>

<template>
  <h4 class="display-4">
    <va-icon size="large" name="info"></va-icon>
    &nbsp;
    How to rate
  </h4>
  <br />
  <div>
    The 5 most similar images among 20 displayed images must be selected for a total of 28 baseline images. 
  </div>
  <br />
  <div>
    Once this is complete, you will be forwarded back to your profile.
  </div>
  <br />
  <div>
    A baseline image is displayed with a blue outline in the first row:
  </div>
  <br />
  <div>
    <MyImage :image_entry='{ "order": 0, "compare_vehicle": 1, "compare_ride": 4595074 }' :selected_entry="false"
      :selectable_entry="false" />
  </div>
  <br />
  <div>
    Among 20 displayed images with a red outline, 5 images that are the most similar to the baseline image must
    be selected by clicking on the image.
  </div>
  <br />
  <div>
    Once an image is selected, the outline will become green.
  </div>
  <br />
  <div>
    Selection can be reversed or repeated by clicking on the image once again.
  </div>
  <br />
  <div>
    <MyImage :image_entry='selected_similar[0]' :selected_entry="true" :selectable_entry="false" :use_color="true" />
    <MyImage :image_entry='selected_similar[selected_similar.length - 1]' :selected_entry="false"
      :selectable_entry="false" :use_color="true" />
  </div>
  <br />
  <div>
    Once exactly 5 images are selected, the selection can be sent to the database by clicking on the
    Send button.
  </div>
  <br />
  <div>
    <va-button :rounded="false" style="border: none" :disabled="true">Send</va-button>
  </div>
  <br />
  <div>
    The button will be disabled unless exactly 5 images are selected.
  </div>
</template>

<style scoped></style>
