<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AllData from '../../assets/all_no_data.json'
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
import MyCounter from "./MyCounter.vue";
import { ratingsRef } from "../../firebase_main.js";
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
        return {
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
                { key: "chosen", sortable: false, classes: "data_table_overflow" },
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
        getSumChosen(chosenID) {
            let sum_row = 0;
            for (var ix_chosen = 0; ix_chosen < chosenID.length; ix_chosen += 1) {
                sum_row += (parseInt(chosenID[ix_chosen].split("_")[2]) - 1) / 114 - ix_chosen;
            }
            return sum_row;
        },
        fetch_rides() {
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
                            continue
                        }
                        for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                            this.rides.push({
                                vehicle: AllData.vehicles[i].vehicle,
                                ride: AllData.vehicles[i].rides[j].ride,
                                ws: ws_use,
                                combined: AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use,
                                chosen: []
                            });
                        }
                    }
                }
                for (var i = 0; i < AllData.vehicles.length; i++) {
                    if (AllData.vehicles[i].vehicle >= 10) {
                        if (this.isUsedVehicle({ "value": i, "text": AllData.vehicles[i].vehicle }) == "danger") {
                            continue
                        }
                        for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                            this.rides.push({
                                vehicle: AllData.vehicles[i].vehicle,
                                ride: AllData.vehicles[i].rides[j].ride,
                                ws: ws_use,
                                combined: AllData.vehicles[i].vehicle + "_" + AllData.vehicles[i].rides[j].ride + "_" + ws_use,
                                chosen: []
                            });
                        }
                    }
                }
            }
            let me = this;
            me.sum_of_table = 0;
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
                                var string_rated = me.rides[ix_rated].vehicle + "_" + me.rides[ix_rated].ride + "_" + me.rides[ix_rated].ws
                                if (string_rated == string_find) {
                                    me.rides[ix_rated].chosen = chosenID;
                                    me.sum_of_table += me.getSumChosen(chosenID);
                                    break;
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
                            if (me.rides[ix_rides].chosen.length == 0) {
                                continue
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
        stringForRow() {
            var str_row = "vehicle;ride;ws;user;chosen\n";
            for (var ix_row = 0; ix_row < this.rides.length; ix_row += 1) {
                var cr = this.rides[ix_row];
                if (cr.chosen.length > 0) {
                    str_row += cr.vehicle + ";" + cr.ride + ";" + cr.ws + ";" + this.$props.user_to_find + ";"
                    for (var ix_chosen = 0; ix_chosen < cr.chosen.length; ix_chosen += 1) {
                        str_row += cr.chosen[ix_chosen];
                        if (ix_chosen != cr.chosen.length - 1) {
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
    <LoadingBar v-if="!fully_loaded"></LoadingBar>
    <span v-else>
        <br />
        <va-card>
            <br />
            <div>
                <va-checkbox style="display: inline-block" label="Only rated" v-model="only_rated" />
            </div>
            <br />
            <h4>
                <va-icon name="window"></va-icon>
                Window size
            </h4>
            <br />
            <div>
                <va-button v-on:click="selectAllSizes(true)" icon="done">All window sizes</va-button>
                &nbsp;
                <va-button v-on:click="selectAllSizes(false)" icon="close">No window sizes</va-button>
            </div>
            <br />
            <div>
                <va-button size="small" outline :rounded="false" style="border: none" :color="isUsedSize(s.size)"
                    v-for="s in only_rated_sizes" v-on:click="useSize(s.size)">{{ s.size }}
                </va-button>
            </div>
            <br />
            <h4>
                <va-icon name="water"></va-icon>
                Vehicle
            </h4>
            <br />
            <div>
                <va-button v-on:click="selectAllVehicles(true)" icon="done">All vehicles</va-button>
                &nbsp;
                <va-button v-on:click="selectAllVehicles(false)" icon="close">No vehicles</va-button>
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
        <span v-if="rides.length > 0">
            <span v-if="is_admin">
                <div>
                    {{ sum_of_table }} /
                    {{ rides.length }} =
                    {{ sum_of_table / rides.length }}
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
                <template #header(chosen)>User rated</template>
                <template #cell(chosen)="{ source: chosen }">
                    <va-button outline :rounded="false" style="border: none" v-if="chosen.length > 0" icon="done"
                        color="success" />
                    <va-button outline :rounded="false" style="border: none" v-else icon="close" color="danger" />
                    <span v-if="is_admin">
                        &nbsp;{{ getSumChosen(chosen) }}
                    </span>
                </template>
            </va-data-table>
        </span>
        <NoDataToDisplay v-if="rides.length <= 0" customMessage="No rides">
        </NoDataToDisplay>
    </span>
</template>

<style scoped></style>
