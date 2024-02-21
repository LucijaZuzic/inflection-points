<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AllData from '../../assets/all_no_data.json'
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
import MyCounter from "./MyCounter.vue";
import CombinedRoute from "./CombinedRoute.vue";
import { ratingsRef } from "../../firebase_main.js";
export default {
    components: {
        NoDataToDisplay,
        LoadingBar,
        MyCounter,
        CombinedRoute
    },
    props: ["user_to_find"],
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
        this.getRidesVehicles();
        this.only_rated_sizes = [];
        for (var ws_use = 5; ws_use < 25; ws_use += 5) {
            this.only_rated_sizes.push({ "size": ws_use, "use_size": true });
        }
        return {
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
            columns: [],
            sortBy: "score",
            sortingOrder: "asc",
            perPage: 1,
            currentPage: 1,
            columns: [
                { key: "vehicle", sortable: true, classes: "data_table_overflow" },
                { key: "ride", sortable: true, classes: "data_table_overflow" },
                { key: "combined", sortable: false, classes: "data_table_overflow" },
            ],
            sortingOrderOptions: [
                { text: "Uzlazno", value: "asc" },
                { text: "Silazno", value: "desc" },
                { text: "Bez sortiranja", value: null },
            ],
        };
    },
    methods: {
        getRidesVehicles() {
            this.vehicle_ix_array = [];
            this.vehicle_ix_used = [];
            for (var i = 0; i < AllData.vehicles.length; i++) {
                if (AllData.vehicles[i].vehicle < 10) {
                    if (AllData.vehicles[i].rides.length > 0) {
                        this.vehicle_ix_array.push({ "value": i, "text": AllData.vehicles[i].vehicle });
                        this.vehicle_ix_used.push({ "value": i, "text": AllData.vehicles[i].vehicle, "used": true });
                    }
                }
            }
            for (var i = 0; i < AllData.vehicles.length; i++) {
                if (AllData.vehicles[i].vehicle >= 10) {
                    if (AllData.vehicles[i].rides.length > 0) {
                        this.vehicle_ix_array.push({ "value": i, "text": AllData.vehicles[i].vehicle });
                        this.vehicle_ix_used.push({ "value": i, "text": AllData.vehicles[i].vehicle, "used": true });
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
        },
        filterExact(source) {
            if (this.filter === "") {
                return true;
            }
            return source?.toString?.() === this.filter;
        },
        fetch_rides() {
            this.fully_loaded = false;
            this.rides = [];
            for (var i = 0; i < AllData.vehicles.length; i++) {
                if (AllData.vehicles[i].vehicle < 10) {
                    if (this.isUsedVehicle({ "value": i, "text": AllData.vehicles[i].vehicle }) == "danger") {
                        continue
                    }
                    for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                        this.rides.push({
                            vehicle: AllData.vehicles[i].vehicle,
                            ride: AllData.vehicles[i].rides[j].ride,
                            combined: AllData.vehicles[i].vehicle.toString() + "_" + AllData.vehicles[i].rides[j].ride.toString()
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
                            combined: AllData.vehicles[i].vehicle.toString() + "_" + AllData.vehicles[i].rides[j].ride.toString()
                        });
                    }
                }
            }
            this.rated_array = [];
            for (var ws_use = 5; ws_use < 25; ws_use += 5) {
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
            let me = this;
            ratingsRef
                .get()
                .then(function (snapshotRating) {
                    snapshotRating.forEach(function (childSnapshotRating) {
                        let vehicleID = childSnapshotRating.get("vehicle");
                        let rideID = childSnapshotRating.get("ride");
                        let wsID = childSnapshotRating.get("ws");
                        let userID = childSnapshotRating.get("userID");
                        if (userID == me.$props.user_to_find) {
                            var string_find = vehicleID + "_" + rideID + "_" + wsID;
                            for (var ix_rated = 0; ix_rated < me.rated_array.length; ix_rated += 1) {
                                if (me.rated_array[ix_rated].string_rated == string_find) {
                                    me.rated_array[ix_rated].rated_before = true;
                                }
                            }
                        }
                    });
                })
                .then(() => {
                    if (me.only_rated) {
                        let only_rated_rides = [];
                        for (var ws_use = 5; ws_use < 25; ws_use += 5) {
                            if (this.isUsedSize(ws_use) == "danger") {
                                continue
                            }
                            for (var ix_rides = 0; ix_rides < me.rides.length; ix_rides += 1) {
                                if (me.getStatus(me.rides[ix_rides].combined + "_" + ws_use)) {
                                    only_rated_rides.push(me.rides[ix_rides]);
                                }
                            }
                        }
                        me.rides = only_rated_rides;
                    }
                    me.filtered = me.rides;
                    me.perPage = 1;
                    me.currentPage = 1;
                    me.fully_loaded = true;
                });
        },
        getStatus(combined_string) {
            for (var ix_rated = 0; ix_rated < this.rated_array.length; ix_rated += 1) {
                if (this.rated_array[ix_rated].string_rated == combined_string) {
                    return this.rated_array[ix_rated].rated_before;
                }
            }
            return false;
        },
        useSize(some_size) {
            for (var ix_size = 0; ix_size < this.only_rated_sizes.length; ix_size += 1) {
                if (this.only_rated_sizes[ix_size].size == some_size) {
                    this.only_rated_sizes[ix_size].use_size = !this.only_rated_sizes[ix_size].use_size;
                }
            }
            if (this.only_rated) {
                this.fetch_rides();
            }
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
        useVehicle(some_vehicle) {
            for (var ix_vehicle = 0; ix_vehicle < this.vehicle_ix_used.length; ix_vehicle += 1) {
                if (this.vehicle_ix_used[ix_vehicle].value == some_vehicle.value && this.vehicle_ix_used[ix_vehicle].text == some_vehicle.text) {
                    this.vehicle_ix_used[ix_vehicle].used = !this.vehicle_ix_used[ix_vehicle].used;
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
        sortByOptions() {
            return this.columns.map(({ key }) => key);
        }
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
        }
    }
};
</script>

<template>
    <body class="my_body">
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
                <h4 v-if="only_rated">Window size</h4>
                <br v-if="only_rated" />
                <va-button size="small" v-if="only_rated" outline :rounded="false" style="border: none" :color="isUsedSize(s.size)"
                    v-for="s in only_rated_sizes" v-on:click="useSize(s.size)">{{ s.size }}
                </va-button>
                <br v-if="only_rated" />
                <va-card-content>
                    <h4>Vehicles</h4>
                    <br />
                    <va-button size="small" outline :rounded="false" style="border: none" :color="isUsedVehicle(v)"
                        v-for="v in vehicle_ix_array" v-on:click="useVehicle(v)">{{ v.text }}
                    </va-button>
                </va-card-content>
            </va-card>
            <br />
            <span v-if="rides.length > 0">
                <div>
                    <div style="display: inline-block">
                        <MyCounter :key="'perPage_' + perPage" :min_value="1" :max_value="Math.min(Math.ceil(this.filtered.length), 10)"
                            v-bind:value="perPage" @input="(n) => (perPage = n)" :is_page_size="true"
                            :some_text="'Per page'">
                        </MyCounter>
                    </div>
                    <div style="display: inline-block; margin-left: 10px">
                        <MyCounter :key="'currentPage_' + currentPage" :min_value="1" :max_value="Math.ceil(this.filtered.length / perPage)"
                            v-bind:value="currentPage" @input="(n) => (currentPage = n)" :is_page_number="true"
                            :some_text="'Page'">
                        </MyCounter>
                    </div>
                </div>
                <br />
                <va-data-table :items="rides" :filter="filter" :columns="columns" :hoverable="true" :per-page="perPage"
                    :current-page="currentPage" v-model:sort-by="sortBy" v-model:sorting-order="sortingOrder"
                    @filtered="filtered = $event.items" no-data-filtered-html="No results"
                    no-data-html="No data" :filter-method="customFilteringFn">
                    <template #header(vehicle)>Vehicle</template>
                    <template #header(ride)>Ride</template>
                    <template #header(combined)>User rated</template>
                    <template #cell(combined)="{ source: combined }">
                        <CombinedRoute v-for="ws_use in only_rated_sizes" :combined_route="combined + '_' + ws_use.size"
                            :status_route="getStatus(combined + '_' + ws_use.size)" />
                    </template>
                </va-data-table>
            </span>
            <NoDataToDisplay v-if="rides.length <= 0" customMessage="No rides">
            </NoDataToDisplay>
        </span>
    </body>
</template>

<style scoped></style>
