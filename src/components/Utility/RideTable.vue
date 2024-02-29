<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AllData from '../../assets/all_no_data_short.json'
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
import MyCounter from "./MyCounter.vue";
import { ratingsRef } from "../../firebase_main.js";
import AllSimilar5 from '../../assets/marker_all_percent_1_5.json';
import AllSimilar10 from '../../assets/marker_all_percent_1_10.json';
import AllSimilar15 from '../../assets/marker_all_percent_1_15.json';
import AllSimilar20 from '../../assets/marker_all_percent_1_20.json';
export default {
    components: {
        NoDataToDisplay,
        LoadingBar,
        MyCounter,
    },
    props: ["user_to_find", "is_admin"],
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
        this.vehicle_ix_array = [];
        this.vehicle_ix_used = [];
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle < 10) {
                if (AllData.vehicles[i].rides.length > 0) {
                    this.vehicle_ix_array.push({ "value": i, "text": AllData.vehicles[i].vehicle });
                    this.vehicle_ix_used.push({ "value": i, "text": AllData.vehicles[i].vehicle, "used": false });
                }
            }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle >= 10) {
                if (AllData.vehicles[i].rides.length > 0) {
                    this.vehicle_ix_array.push({ "value": i, "text": AllData.vehicles[i].vehicle });
                    this.vehicle_ix_used.push({ "value": i, "text": AllData.vehicles[i].vehicle, "used": false });
                }
            }
        }
        this.ride_ix_array = [];
        for (var i = 0; i < AllData.vehicles.length; i++) {
            this.ride_ix_array.push([]);
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                this.ride_ix_array[this.ride_ix_array.length - 1].push({ "value": j, "text": AllData.vehicles[i].rides[j].ride });
            }
        }
        this.only_rated_sizes = [];
        for (var ws_use = 20; ws_use < 25; ws_use += 5) {
            this.only_rated_sizes.push({ "size": ws_use, "use_size": false });
        }
        this.rides_for_vehicles = [];
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle < 10) {
                let rides_for_a_vehicle = [];
                for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                    rides_for_a_vehicle.push({
                        ride: AllData.vehicles[i].rides[j].ride,
                        used: false
                    });
                }
                this.rides_for_vehicles.push({
                    vehicle: AllData.vehicles[i].vehicle,
                    visible: false,
                    rides: rides_for_a_vehicle
                });
            }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle >= 10) {
                let rides_for_a_vehicle = [];
                for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                    rides_for_a_vehicle.push({
                        ride: AllData.vehicles[i].rides[j].ride,
                        used: false
                    });
                }
                this.rides_for_vehicles.push({
                    vehicle: AllData.vehicles[i].vehicle,
                    visible: false,
                    rides: rides_for_a_vehicle
                });
            }
        }
        this.getMaxMinEuclid();
        return {
            showRides: false,
            mutateVisibility: false,
            apply_filter: false,
            apply_user: false,
            only_rated: false,
            vehicles: AllData,
            user: null,
            fully_loaded: false,
            rides: [],
            selectedItemsEmitted: [],
            new_item: "",
            new_item_tag: "",
            filterBy: "",
            new_item_exact: false,
            filter: "",
            useCustomFilteringFn: false,
            filters: [],
            filtered: [],
            perPage: 1,
            currentPage: 1,
            columns: [
                { key: "vehicle", sortable: true, classes: "data_table_overflow" },
                { key: "ride", sortable: true, classes: "data_table_overflow" },
                { key: "ws", sortable: true, classes: "data_table_overflow" },
                { key: "combined", sortable: false, classes: "data_table_overflow" }
            ]
        };
    },
    methods: {
        filterExact(source) {
            if (this.filter === "") {
                return true;
            }
            return source?.toString?.() === this.filter;
        },
        getSumChosenEuclid(combinedData) {
            let original = combinedData.original.split("_");
            let chosenID = combinedData.other;
            var AllSimilar = AllSimilar5;
            if (original[2] == 10) {
                AllSimilar = AllSimilar10;
            }
            if (original[2] == 15) {
                AllSimilar = AllSimilar15;
            }
            if (original[2] == 20) {
                AllSimilar = AllSimilar20;
            }
            let similar_get = [];
            for (var i = 0; i < AllSimilar.compare_to.length; i++) {
                let some_ride = AllSimilar.compare_to[i];
                if (original[0] == some_ride.vehicle && original[1] == some_ride.ride) {
                    similar_get = some_ride.similar;
                    break;
                }
            }
            let first_five = 0;
            let last_five = 0;
            for (var ix_similar = 0; ix_similar < chosenID.length; ix_similar += 1) {
                first_five += similar_get[ix_similar].distance;
                last_five += similar_get[similar_get.length - 1 - ix_similar].distance;
            }
            let chosen_sum = 0;
            for (var ix_chosen = 0; ix_chosen < chosenID.length; ix_chosen += 1) {
                let other_ride_str = chosenID[ix_chosen].split("_");
                let other_ride = { "order": other_ride_str[2], "compare_vehicle": other_ride_str[0], "compare_ride": other_ride_str[1] };
                for (var ix_similar = 0; ix_similar < similar_get.length; ix_similar += 1) {
                    if (similar_get[ix_similar].compare_vehicle == other_ride.compare_vehicle && similar_get[ix_similar].compare_ride == other_ride.compare_ride && similar_get[ix_similar].order == other_ride.order) {
                        chosen_sum += parseFloat(similar_get[ix_similar].distance);
                        break;
                    }
                }
            }
            return { "first_five": first_five, "chosen_sum": chosen_sum, "last_five": last_five, "diff": chosen_sum - first_five, "max_diff": last_five - first_five, "diff_percent": (chosen_sum - first_five) / (last_five - first_five) * 100 };
        },
        getMedian(values) {

            if (values.length === 0) {
                return -1;
            }

            // Sorting values, preventing original array
            // from being mutated.
            values = [...values].sort((a, b) => a - b);

            let half = Math.floor(values.length / 2);

            return (values.length % 2
                ? values[half]
                : (values[half - 1] + values[half]) / 2
            );

        },
        getMaxMinEuclid() {
            this.euclid_ranges = [];
            this.avg_euclid_range = 0;
            this.min_euclid_range = 1000;
            this.min_euclid_range_first = -1;
            this.min_euclid_range_last = -1;
            this.max_euclid_range = 0;
            this.max_euclid_range_first = -1;
            this.max_euclid_range_last = -1;
            this.min_euclid_first = 1000;
            this.max_euclid_first = 0;
            this.min_euclid_last = 1000;
            this.max_euclid_last = 0;
            for (var ws_use = 20; ws_use < 25; ws_use += 5) {
                if (this.isUsedSize(ws_use) == "danger") {
                    continue;
                }
                var AllSimilar = AllSimilar5;
                if (ws_use == 10) {
                    AllSimilar = AllSimilar10;
                }
                if (ws_use == 15) {
                    AllSimilar = AllSimilar15;
                }
                if (ws_use == 20) {
                    AllSimilar = AllSimilar20;
                }
                for (var i = 0; i < AllData.vehicles.length; i++) {
                    for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                        let similar_get = [];
                        for (var ix = 0; ix < AllSimilar.compare_to.length; ix++) {
                            let some_ride = AllSimilar.compare_to[ix];
                            if (AllData.vehicles[i].vehicle == some_ride.vehicle && AllData.vehicles[i].rides[j].ride == some_ride.ride) {
                                similar_get = some_ride.similar;
                                break;
                            }
                        }
                        let first_five = 0;
                        let last_five = 0;
                        for (var ix_similar = 0; ix_similar < 5; ix_similar += 1) {
                            first_five += similar_get[ix_similar].distance;
                            last_five += similar_get[similar_get.length - 1 - ix_similar].distance;
                        }
                        var euclid_range = last_five - first_five;
                        this.avg_euclid_range += euclid_range;
                        this.euclid_ranges.push(euclid_range);
                        if (euclid_range > this.max_euclid_range) {
                            this.max_euclid_range = euclid_range;
                            this.max_euclid_range_first = first_five;
                            this.max_euclid_range_last = last_five;
                        }
                        if (euclid_range < this.min_euclid_range) {
                            this.min_euclid_range = euclid_range;
                            this.min_euclid_range_first = first_five;
                            this.min_euclid_range_last = last_five;
                        }
                        this.min_euclid_first = Math.min(this.min_euclid_first, first_five);
                        this.max_euclid_first = Math.max(this.max_euclid_first, first_five);
                        this.min_euclid_last = Math.min(this.min_euclid_last, last_five);
                        this.max_euclid_last = Math.max(this.max_euclid_last, last_five);
                    }
                }
            }
            this.avg_euclid_range /= this.euclid_ranges.length;
            this.median_euclid_range = this.getMedian(this.euclid_ranges);
        },
        getSumChosen(chosenID) {
            let sum_row = 0;
            let one_chosen = false;
            let correct_chosen = 0;
            let max_sum_row = (20 - chosenID.length) * chosenID.length;
            for (var ix_chosen = 0; ix_chosen < chosenID.length; ix_chosen += 1) {
                let ord_chosen = (parseInt(chosenID[ix_chosen].split("_")[2]) - 1) / 114 - ix_chosen;
                sum_row += ord_chosen;
                if (ord_chosen == 0) {
                    one_chosen = true;
                }
                if (ord_chosen < 5) {
                    correct_chosen += 1;
                }
            }
            return { "sum_row": sum_row, "max_sum_row": max_sum_row, "percentage": sum_row / max_sum_row * 100, "one_chosen": one_chosen, "correct_chosen": correct_chosen };
        },
        getVehicleIx(vehicle_name) {
            for (var i = 0; i < this.rides_for_vehicles.length; i++) {
                if (this.rides_for_vehicles[i].vehicle == vehicle_name) {
                    return i;
                }
            }
        },
        getVisible(vehicle_ix) {
            return this.rides_for_vehicles[vehicle_ix].visible;
        },
        getIcon(val) {
            if (val) {
                return "expand_less"
            } else {
                return "expand_more"
            }
        },
        changeVisible(vehicle_ix) {
            this.mutateVisibility = !this.mutateVisibility;
            this.rides_for_vehicles[vehicle_ix].visible = !this.rides_for_vehicles[vehicle_ix].visible;
        },
        getRideIx(vehicle_ix, ride_name) {
            for (var i = 0; i < this.rides_for_vehicles[vehicle_ix].rides.length; i++) {
                if (this.rides_for_vehicles[vehicle_ix].rides[i].ride == ride_name) {
                    return i;
                }
            }
        },
        fetch_rides() {
            this.getMaxMinEuclid();
            this.rendering_key = !this.rendering_key;
            this.fully_loaded = false;
            this.rides = [];
            for (var ws_use = 20; ws_use < 25; ws_use += 5) {
                if (this.isUsedSize(ws_use) == "danger") {
                    continue;
                }
                for (var i = 0; i < AllData.vehicles.length; i++) {
                    if (AllData.vehicles[i].vehicle < 10) {
                        if (this.isUsedVehicle({ "value": i, "text": AllData.vehicles[i].vehicle }) == "danger") {
                            continue;
                        }
                        for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                            if (this.isUsedRide(this.getVehicleIx(AllData.vehicles[i].vehicle), this.getRideIx(this.getVehicleIx(AllData.vehicles[i].vehicle), AllData.vehicles[i].rides[j].ride)) == "danger") {
                                continue;
                            }
                            this.rides.push({
                                vehicle: AllData.vehicles[i].vehicle,
                                ride: AllData.vehicles[i].rides[j].ride,
                                ws: ws_use,
                                combined: { "original": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "other": [] }
                            });
                        }
                    }
                }
                for (var i = 0; i < AllData.vehicles.length; i++) {
                    if (AllData.vehicles[i].vehicle >= 10) {
                        if (this.isUsedVehicle({ "value": i, "text": AllData.vehicles[i].vehicle }) == "danger") {
                            continue;
                        }
                        for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                            if (this.isUsedRide(this.getVehicleIx(AllData.vehicles[i].vehicle), this.getRideIx(this.getVehicleIx(AllData.vehicles[i].vehicle), AllData.vehicles[i].rides[j].ride)) == "danger") {
                                continue;
                            }
                            this.rides.push({
                                vehicle: AllData.vehicles[i].vehicle,
                                ride: AllData.vehicles[i].rides[j].ride,
                                ws: ws_use,
                                combined: { "original": AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use, "other": [] }
                            });
                        }
                    }
                }
            }
            let me = this;
            me.count_rated = 0;
            me.num_correct = 0;
            me.num_one = 0;
            me.sum_of_table = 0;
            me.sum_of_table_euclid = 0;
            me.sum_of_table_euclid_percent = 0;
            ratingsRef
                .get()
                .then(function (snapshotRating) {
                    snapshotRating.forEach(function (childSnapshotRating) {
                        let vehicleID = childSnapshotRating.get("vehicle");
                        let rideID = childSnapshotRating.get("ride");
                        let wsID = childSnapshotRating.get("ws");
                        let userID = childSnapshotRating.get("userID");
                        let chosenID = childSnapshotRating.get("chosen");
                        if (userID == me.$props.user_to_find) {
                            var string_find = vehicleID + "_" + rideID + "_" + wsID;
                            for (var ix_rated = 0; ix_rated < me.rides.length; ix_rated += 1) {
                                var string_rated = me.rides[ix_rated].vehicle + "_" + me.rides[ix_rated].ride + "_" + me.rides[ix_rated].ws;
                                if (string_rated == string_find) {
                                    var sum_diff = me.getSumChosen(chosenID);
                                    var euclid_diff = me.getSumChosenEuclid({ "original": string_rated, "other": chosenID });
                                    if (!me.rides[ix_rated].combined.other.length > 0) {
                                        me.rides[ix_rated].combined.other = chosenID;
                                        me.sum_of_table += sum_diff.sum_row;
                                        me.num_correct += sum_diff.correct_chosen;
                                        me.num_one += sum_diff.one_chosen;
                                        me.sum_of_table_euclid += euclid_diff.diff;
                                        me.sum_of_table_euclid_percent += euclid_diff.diff_percent;
                                        me.count_rated += 1;
                                        break;
                                    } else {
                                        var sum_diff_already = me.getSumChosen(me.rides[ix_rated].combined.other);
                                        var euclid_diff_already = me.getSumChosenEuclid(me.rides[ix_rated].combined);
                                        if (sum_diff.sum_row < sum_diff_already.sum_row) {
                                            me.rides[ix_rated].combined.other = chosenID;
                                            me.sum_of_table -= sum_diff_already.sum_row;
                                            me.sum_of_table += sum_diff.sum_row;
                                            me.num_correct -= sum_diff_already.correct_chosen;
                                            me.num_correct += sum_diff.correct_chosen;
                                            me.num_one -= sum_diff_already.one_chosen;
                                            me.num_one += sum_diff.one_chosen;
                                            me.sum_of_table_euclid -= euclid_diff_already.diff;
                                            me.sum_of_table_euclid += euclid_diff.diff;
                                            me.sum_of_table_euclid_percent -= euclid_diff_already.diff_percent;
                                            me.sum_of_table_euclid_percent += euclid_diff.diff_percent;
                                        }
                                    }
                                }
                            }
                        }
                    });
                })
                .then(() => {
                    this.originalText = this.stringForRow();
                    if (me.only_rated) {
                        let only_rated_rides = [];
                        for (var ix_rides = 0; ix_rides < me.rides.length; ix_rides += 1) {
                            if (me.rides[ix_rides].combined.other.length == 0) {
                                continue;
                            }
                            only_rated_rides.push(me.rides[ix_rides]);
                        }
                        me.rides = only_rated_rides;
                    }
                    me.filtered = me.rides;
                    me.perPage = 1;
                    me.currentPage = 1;
                    me.fully_loaded = true;
                });
        },
        selectAllSizes(status_size) {
            for (var ix_size = 0; ix_size < this.only_rated_sizes.length; ix_size += 1) {
                this.only_rated_sizes[ix_size].use_size = status_size;
            }
            this.fetch_rides();
        },
        useSize(some_size) {
            for (var ix_size = 0; ix_size < this.only_rated_sizes.length; ix_size += 1) {
                if (this.only_rated_sizes[ix_size].size == some_size) {
                    this.only_rated_sizes[ix_size].use_size = !this.only_rated_sizes[ix_size].use_size;
                    break;
                }
            }
            this.fetch_rides();
        },
        isUsedSize(some_size) {
            for (var ix_size = 0; ix_size < this.only_rated_sizes.length; ix_size += 1) {
                if (this.only_rated_sizes[ix_size].size == some_size) {
                    if (this.only_rated_sizes[ix_size].use_size) {
                        return "success";
                    } else {
                        return "danger";
                    }
                }
            }
            return "danger";
        },
        selectAllVehicles(status_vehicle) {
            for (var ix_vehicle = 0; ix_vehicle < this.vehicle_ix_used.length; ix_vehicle += 1) {
                this.vehicle_ix_used[ix_vehicle].used = status_vehicle;
            }
            this.fetch_rides();
        },
        useVehicle(some_vehicle) {
            for (var ix_vehicle = 0; ix_vehicle < this.vehicle_ix_used.length; ix_vehicle += 1) {
                if (this.vehicle_ix_used[ix_vehicle].value == some_vehicle.value && this.vehicle_ix_used[ix_vehicle].text == some_vehicle.text) {
                    this.vehicle_ix_used[ix_vehicle].used = !this.vehicle_ix_used[ix_vehicle].used;
                    break;
                }
            }
            this.fetch_rides();
        },
        isUsedVehicle(some_vehicle) {
            for (var ix_vehicle = 0; ix_vehicle < this.vehicle_ix_used.length; ix_vehicle += 1) {
                if (this.vehicle_ix_used[ix_vehicle].value == some_vehicle.value && this.vehicle_ix_used[ix_vehicle].text == some_vehicle.text) {
                    if (this.vehicle_ix_used[ix_vehicle].used) {
                        return "success";
                    } else {
                        return "danger";
                    }
                }
            }
            return "danger";
        },
        findVehicle(some_vehicle_text) {
            for (var ix_vehicle = 0; ix_vehicle < this.vehicle_ix_used.length; ix_vehicle += 1) {
                if (this.vehicle_ix_used[ix_vehicle].text == some_vehicle_text) {
                    return this.vehicle_ix_used[ix_vehicle]
                }
            }
            return -1;
        },
        selectAllRides(status_ride) {
            for (var ix_vehicle = 0; ix_vehicle < this.rides_for_vehicles.length; ix_vehicle += 1) {
                for (var ix_ride = 0; ix_ride < this.rides_for_vehicles[ix_vehicle].rides.length; ix_ride += 1) {
                    this.rides_for_vehicles[ix_vehicle].rides[ix_ride].used = status_ride;
                }
            }
            this.fetch_rides();
        },
        selectAllRidesVehicle(status_ride, ix_vehicle) {
            for (var ix_ride = 0; ix_ride < this.rides_for_vehicles[ix_vehicle].rides.length; ix_ride += 1) {
                this.rides_for_vehicles[ix_vehicle].rides[ix_ride].used = status_ride;
            }
            this.fetch_rides();
        },
        useRide(ix_vehicle, ix_ride) {
            this.rides_for_vehicles[ix_vehicle].rides[ix_ride].used = !this.rides_for_vehicles[ix_vehicle].rides[ix_ride].used;
            this.fetch_rides();
        },
        isUsedRide(ix_vehicle, ix_ride) {
            if (this.rides_for_vehicles.length > ix_vehicle) {
                if (this.rides_for_vehicles[ix_vehicle].rides.length > ix_ride) {
                    if (this.rides_for_vehicles[ix_vehicle].rides[ix_ride].used) {
                        return "success";
                    } else {
                        return "danger";
                    }
                }
                return "danger";
            }
        },
        stringForRow() {
            var str_row = "vehicle;ride;ws;user;chosen\n";
            for (var ix_row = 0; ix_row < this.rides.length; ix_row += 1) {
                var cr = this.rides[ix_row];
                if (cr.combined.other.length > 0) {
                    str_row += cr.vehicle + ";" + cr.ride + ";" + cr.ws + ";" + this.$props.user_to_find + ";"
                    for (var ix_chosen = 0; ix_chosen < cr.combined.other.length; ix_chosen += 1) {
                        str_row += cr.combined.other[ix_chosen];
                        if (ix_chosen != cr.combined.other.length - 1) {
                            str_row += ":"
                        }
                    }
                    str_row += "\n"
                }
            }
            return str_row;
        },
    },
    created() {
        this.fetch_rides();
    },
    computed: {
        customFilteringFn() {
            return this.useCustomFilteringFn ? this.filterExact : undefined;
        },
        pages() {
            return this.perPage && this.perPage !== 0
                ? Math.ceil(this.filtered.length / this.perPage)
                : this.filtered.length;
        },
    },
    watch: {
        perPage: function () {
            this.currentPage = 1;
        },
        only_rated: function () {
            this.fetch_rides();
        },
        apply_filter: function () {
            this.rendering_key = !this.rendering_key;
        },
        apply_user: function () {
            this.rendering_key = !this.rendering_key;
        }
    }
};
</script>

<template>
    <h4 class="display-4">
        <va-icon size="large" name="rule_folder"></va-icon>
        &nbsp; Find rides
    </h4>
    <va-divider></va-divider>
    <LoadingBar v-if="!fully_loaded"></LoadingBar>
    <span v-else>
        <div>
            <va-checkbox style="display: inline-block" label="Only rated" v-model="only_rated" />
        </div>
        <br />
        <va-card>
            <br />
            <div>
                <h4 style="display: inline-block">
                    <va-icon name="window"></va-icon>
                    &nbsp;
                    Window size
                </h4>
                &nbsp;
                <va-button v-on:click="selectAllSizes(true)" icon="done" outline :rounded="false" style="border: none">All
                    window sizes</va-button>
                &nbsp;
                <va-button v-on:click="selectAllSizes(false)" icon="close" outline :rounded="false" style="border: none">No
                    window sizes</va-button>
            </div>
            <br />
            <div>
                <va-button size="small" outline :rounded="false" style="border: none" :color="isUsedSize(s.size)"
                    v-for="s in only_rated_sizes" v-on:click="useSize(s.size)">{{ s.size }}
                </va-button>
            </div>
            <br />
        </va-card>
        <br />
        <va-card>
            <br />
            <div>
                <h4>
                    <h4 style="display: inline-block">
                        <va-icon name="water"></va-icon>
                        &nbsp;
                        Vehicle
                    </h4>
                    &nbsp;
                    <va-button v-on:click="selectAllVehicles(true)" icon="done" outline :rounded="false"
                        style="border: none">All vehicles</va-button>
                    &nbsp;
                    <va-button v-on:click="selectAllVehicles(false)" icon="close" outline :rounded="false"
                        style="border: none">No vehicles</va-button>
                </h4>
            </div>
            <br />
            <div>
                <va-button size="small" outline :rounded="false" style="border: none" :color="isUsedVehicle(v)"
                    v-for="v in vehicle_ix_array" v-on:click="useVehicle(v)">{{ v.text }}
                </va-button>
            </div>
            <br />
        </va-card>
        <br />
        <va-card>
            <br />
            <div>
                <h4 style="display: inline-block">
                    <va-icon name="route"></va-icon>
                    &nbsp;
                    Rides
                </h4>
                &nbsp;
                <va-button :key="showRides + '_1'" outline :rounded="false" style="border: none" :icon="getIcon(showRides)"
                    v-on:click="showRides = !showRides" />
                &nbsp;
                <va-button v-on:click="selectAllRides(true)" icon="done" outline :rounded="false" style="border: none">All
                    rides</va-button>
                &nbsp;
                <va-button v-on:click="selectAllRides(false)" icon="close" outline :rounded="false" style="border: none">No
                    rides</va-button>
            </div>
            <br />
        </va-card>
        <br />
        <span v-if="showRides">
            <div v-for="veh in vehicle_ix_array">
                <va-card v-if="isUsedVehicle(veh) != 'danger'">
                    <br />
                    <div>
                        <h4 style="display: inline-block">
                            <va-icon name="water"></va-icon>
                            &nbsp;
                            Vehicle
                            &nbsp;
                            {{ rides_for_vehicles[getVehicleIx(veh.text)].vehicle }}
                        </h4>
                        &nbsp;
                        <va-button :key="mutateVisibility + '_1'" outline :rounded="false" style="border: none"
                            :icon="getIcon(getVisible(getVehicleIx(veh.text)))"
                            v-on:click="changeVisible(getVehicleIx(veh.text))" />
                        &nbsp;
                        <va-button v-on:click="selectAllRidesVehicle(true, getVehicleIx(veh.text))" icon="done" outline
                            :rounded="false" style="border: none">All rides for vehicle
                        </va-button>
                        &nbsp;
                        <va-button v-on:click="selectAllRidesVehicle(false, getVehicleIx(veh.text))" icon="close" outline
                            :rounded="false" style="border: none">No rides for vehicle
                        </va-button>
                    </div>
                    <br />
                    <div v-if="getVisible(getVehicleIx(veh.text))" :key="mutateVisibility + '_2'">
                        <va-button size="small" outline :rounded="false" style="border: none"
                            :color="isUsedRide(getVehicleIx(veh.text), ix_r)"
                            v-for="r, ix_r in rides_for_vehicles[getVehicleIx(veh.text)].rides"
                            v-on:click="useRide(getVehicleIx(veh.text), ix_r)">{{ r.ride }}
                        </va-button>
                    </div>
                    <br v-if="rides_for_vehicles[getVehicleIx(veh.text)].visible" />
                </va-card>
                <br v-if="isUsedVehicle(veh) != 'danger'" />
            </div>
        </span>
        <span v-if="rides.length > 0">
            <span v-if="is_admin && count_rated">
                <div>
                    <b>Rank: &nbsp;</b>
                    {{ sum_of_table }} /
                    {{ count_rated }} =
                    {{ Math.round(sum_of_table / count_rated * 100) / 100 }}
                    &nbsp;
                    {{ Math.round(sum_of_table / count_rated * 100) / 100 }} / 75 =
                    {{ Math.round(sum_of_table / count_rated / 75 * 10000) / 100 }} %
                </div>
                <div>
                    <b>First quartile: &nbsp;</b>
                    {{ num_correct }} /
                    {{ count_rated }} =
                    {{ Math.round(num_correct / count_rated * 100) / 100 }}
                    &nbsp;
                    {{ Math.round(num_correct / count_rated * 100) / 100 }} / 5 =
                    {{ Math.round(num_correct / count_rated / 5 * 10000) / 100 }} %
                </div>
                <div>
                    <b>Most similar: &nbsp;</b>
                    {{ num_one }} /
                    {{ count_rated }} =
                    {{ Math.round(num_one / count_rated * 10000) / 100 }} %
                </div>
                <div>
                    <b>Euclidean: &nbsp;</b>
                    {{ Math.round(sum_of_table_euclid * 100) / 100 }} /
                    {{ count_rated }} =
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }}
                </div>
                <div>
                    <b>Euclidean (percent): &nbsp;</b>
                    {{ Math.round(sum_of_table_euclid_percent * 100) / 100 }} /
                    {{ count_rated }} =
                    {{ Math.round(sum_of_table_euclid_percent / count_rated * 100) / 100 }} %
                </div>
                <div>
                    <b>Euclidean (average): &nbsp;</b>
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }} / {{ Math.round(avg_euclid_range * 100)
                        / 100 }} =
                    {{ Math.round(sum_of_table_euclid / count_rated / avg_euclid_range * 10000) / 100 }}
                    %
                </div>
                <div>
                    <b>Euclidean (median): &nbsp;</b>
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }} / {{ Math.round(median_euclid_range *
                        100) / 100 }} =
                    {{ Math.round(sum_of_table_euclid / count_rated / median_euclid_range * 10000) / 100 }}
                    %
                </div>
                <div>
                    <b>Euclidean (max): &nbsp;</b>
                    {{ Math.round(max_euclid_range_last * 100) / 100 }} - {{ Math.round(max_euclid_range_first * 100) / 100
                    }} =
                    {{ Math.round(max_euclid_range * 100) / 100 }}
                    &nbsp;
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }} / {{ Math.round(max_euclid_range * 100)
                        / 100 }} =
                    {{ Math.round(sum_of_table_euclid / count_rated / max_euclid_range * 10000) / 100 }}
                    %
                </div>
                <div>
                    <b>Euclidean (min): &nbsp;</b>
                    {{ Math.round(min_euclid_range_last * 100) / 100 }} - {{ Math.round(min_euclid_range_first * 100) / 100
                    }} =
                    {{ Math.round(min_euclid_range * 100) / 100 }}
                    &nbsp;
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }} / {{ Math.round(min_euclid_range * 100)
                        / 100 }} =
                    {{ Math.round(sum_of_table_euclid / count_rated / min_euclid_range * 10000) / 100 }}
                    %
                </div>
                <div>
                    <b>Euclidean (min - max): &nbsp;</b>
                    | {{ Math.round(min_euclid_last * 100) / 100 }} - {{ Math.round(max_euclid_first * 100) / 100 }} | =
                    {{ Math.round(Math.abs(min_euclid_last - max_euclid_first) * 100) / 100 }}
                    &nbsp;
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }} / {{ Math.round(Math.abs(min_euclid_last -
                        max_euclid_first) * 100) / 100 }} =
                    {{ Math.round(sum_of_table_euclid / count_rated / Math.abs(min_euclid_last - max_euclid_first) * 10000) / 100 }}
                    %
                </div>
                <div>
                    <b>Euclidean (max - min): &nbsp;</b>
                    {{ Math.round(max_euclid_last * 100) / 100 }} - {{ Math.round(min_euclid_first * 100) / 100 }} =
                    {{ Math.round((max_euclid_last - min_euclid_first) * 100) / 100 }}
                    &nbsp;
                    {{ Math.round(sum_of_table_euclid / count_rated * 100) / 100 }} / {{ Math.round((max_euclid_last -
                        min_euclid_first) * 100) / 100 }} =
                    {{ Math.round(sum_of_table_euclid / count_rated / (max_euclid_last - min_euclid_first) * 10000) / 100 }}
                    %
                </div>
                <br />
                <va-input v-model="originalText" type="textarea" />
                <br />
            </span>
            <div>
                <div style="display: inline-block">
                    <MyCounter :key="'perPage_' + perPage" :min_value="1"
                        :max_value="Math.min(Math.ceil(this.filtered.length), 10)" v-bind:value="perPage"
                        @input="(n) => (perPage = n)" :is_page_size="true" :some_text="'Per page'">
                    </MyCounter>
                </div>
                <div style="display: inline-block; margin-left: 10px">
                    <MyCounter :key="'currentPage_' + currentPage" :min_value="1"
                        :max_value="Math.ceil(this.filtered.length / perPage)" v-bind:value="currentPage"
                        @input="(n) => (currentPage = n)" :is_page_number="true" :some_text="'Page'">
                    </MyCounter>
                </div>
            </div>
            <br />
            <va-data-table :items="rides" :filter="filter" :columns="columns" :hoverable="true" :per-page="perPage"
                :current-page="currentPage" @filtered="filtered = $event.items" no-data-filtered-html="No results"
                no-data-html="No data" :filter-method="customFilteringFn">
                <template #header(vehicle)>Vehicle</template>
                <template #header(ride)>Ride</template>
                <template #header(ws)>Window size</template>
                <template #header(combined)><span v-if="is_admin">Score</span></template>
                <template #cell(combined)="{ source: combined }">
                    <span v-if="combined.other.length">
                        <div>
                            <b>Rank: &nbsp;</b>
                            {{ getSumChosen(combined.other).sum_row }} / 75 =
                            {{ Math.round(getSumChosen(combined.other).sum_row / 75 * 100) / 100 }} %
                        </div>
                        <div>
                            <b>First quartile: &nbsp;</b>
                            {{ getSumChosen(combined.other).correct_chosen }} / 5 =
                            {{ Math.round(getSumChosen(combined.other).correct_chosen / 5 * 10000) / 100 }} %
                        </div>
                        <div>
                            <b>Most similar: &nbsp;</b>
                            <va-icon name="done" v-if="getSumChosen(combined.other).one_chosen"></va-icon>
                            <va-icon name="close" v-else></va-icon>
                        </div>
                        <div>
                            <b>Euclidean: &nbsp;</b>
                            {{ Math.round(getSumChosenEuclid(combined).chosen_sum * 100) / 100 }} - {{
                                Math.round(getSumChosenEuclid(combined).first_five * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }}
                            &nbsp;
                            {{ Math.round(getSumChosenEuclid(combined).last_five * 100) / 100 }} - {{
                                Math.round(getSumChosenEuclid(combined).first_five * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).max_diff * 100) / 100 }}
                        </div>
                        <div>
                            <b>Euclidean (percent): &nbsp;</b>
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round(getSumChosenEuclid(combined).max_diff * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff_percent * 100) / 100 }} %
                        </div>
                        <div>
                            <b>Euclidean (average): &nbsp;</b>
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round(avg_euclid_range * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff / avg_euclid_range * 10000) / 100 }} %
                        </div>
                        <div>
                            <b>Euclidean (median): &nbsp;</b>
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round(median_euclid_range * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff / median_euclid_range * 10000) / 100 }} %
                        </div>
                        <div>
                            <b>Euclidean (max): &nbsp;</b>
                            {{ Math.round(max_euclid_range_last * 100) / 100 }} - {{ Math.round(max_euclid_range_first *
                                100) /
                                100 }} =
                            {{ Math.round(max_euclid_range * 100) / 100 }}
                            &nbsp;
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round(max_euclid_range * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff / max_euclid_range * 10000) / 100 }} %
                        </div>
                        <div>
                            <b>Euclidean (min): &nbsp;</b>
                            {{ Math.round(min_euclid_range_last * 100) / 100 }} - {{ Math.round(min_euclid_range_first *
                                100) /
                                100 }} =
                            {{ Math.round(min_euclid_range * 100) / 100 }}
                            &nbsp;
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round(min_euclid_range * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff / min_euclid_range * 10000) / 100 }} %
                        </div>
                        <div>
                            <b>Euclidean (min - max): &nbsp;</b>
                            | {{ Math.round(min_euclid_last * 100) / 100 }} - {{ Math.round(max_euclid_first * 100) / 100 }} | =
                            {{ Math.round(Math.abs(min_euclid_last - max_euclid_first) * 100) / 100 }}
                            &nbsp;
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round(Math.abs(min_euclid_last - max_euclid_first) * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff / Math.abs(min_euclid_last - max_euclid_first) * 10000)
                                /
                                100 }} %
                        </div>
                        <div>
                            <b>Euclidean (max - min): &nbsp;</b>
                            {{ Math.round(max_euclid_last * 100) / 100 }} - {{ Math.round(min_euclid_first * 100) / 100 }} =
                            {{ Math.round((max_euclid_last - min_euclid_first) * 100) / 100 }}
                            &nbsp;
                            {{ Math.round(getSumChosenEuclid(combined).diff * 100) / 100 }} /
                            {{ Math.round((max_euclid_last - min_euclid_first) * 100) / 100 }} =
                            {{ Math.round(getSumChosenEuclid(combined).diff / (max_euclid_last - min_euclid_first) * 10000)
                                /
                                100 }} %
                        </div>
                    </span>
                </template>
            </va-data-table>
        </span>
        <NoDataToDisplay v-if="rides.length <= 0" customMessage="No rides">
        </NoDataToDisplay>
    </span>
</template>

<style scoped></style>
