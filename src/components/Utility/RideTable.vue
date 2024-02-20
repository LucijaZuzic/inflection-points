<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AllData from '../../assets/all_no_data.json'
import NoDataToDisplay from "./NoDataToDisplay.vue";
import LoadingBar from "./LoadingBar.vue";
import MyCounter from "./MyCounter.vue";
export default {
    components: {
        NoDataToDisplay,
        LoadingBar,
        MyCounter,
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
        var vehicle_ix_array = [];
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle < 10) {
                if (AllData.vehicles[i].rides.length > 0) {
                    vehicle_ix_array.push({ "value": i, "text": AllData.vehicles[i].vehicle });
                }
            }
        }
        for (var i = 0; i < AllData.vehicles.length; i++) {
            if (AllData.vehicles[i].vehicle >= 10) {
                if (AllData.vehicles[i].rides.length > 0) {
                    vehicle_ix_array.push({ "value": i, "text": AllData.vehicles[i].vehicle });
                }
            }
        }
        var ride_ix_array = [];
        for (var i = 0; i < AllData.vehicles.length; i++) {
            ride_ix_array.push([]);
            for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                ride_ix_array[ride_ix_array.length - 1].push({ "value": j, "text": AllData.vehicles[i].rides[j].ride });
            }
        }
        return {
            vehicles: AllData,
            selected_vehicle_ix: vehicle_ix_array[0], 
            selected_ride_ix: ride_ix_array[vehicle_ix_array[0].value][0], 
            vehicle_ix_array: vehicle_ix_array,
            ride_ix_array: ride_ix_array,
            user: null,
            fully_loaded: false,
            rides: [],
            status: [],
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
                { key: "ride", sortable: false, classes: "data_table_overflow" }, 
                { key: "combined5", sortable: true, classes: "data_table_overflow" },
                { key: "combined10", sortable: true, classes: "data_table_overflow" },
                { key: "combined15", sortable: true, classes: "data_table_overflow" },
                { key: "combined20", sortable: true, classes: "data_table_overflow" },
            ],
            sortingOrderOptions: [
                { text: "Uzlazno", value: "asc" },
                { text: "Silazno", value: "desc" },
                { text: "Bez sortiranja", value: null },
            ],
        };
    },
    methods: {
        filterExact(source) {
            if (this.filter === "") {
                return true;
            }
            return source?.toString?.() === this.filter;
        },
        fetch_rides() {
            this.rides = [];
            this.status = [];
            let me = this; 
            for (var i = 0; i < AllData.vehicles.length; i++) {
                if (this.selected_vehicle_ix.text != -1 && this.selected_vehicle_ix.text != AllData.vehicles[i].vehicle) {
                    continue
                }
                for (var j = 0; j < AllData.vehicles[i].rides.length; j++) {
                    if (this.selected_ride_ix.text != -1 && this.selected_ride_ix.text != AllData.vehicles[i].rides[j].ride) {
                        continue
                    }
                    var part1 = AllData.vehicles[i].vehicle.toString() + "_" + AllData.vehicles[i].rides[j].ride.toString() 
                    me.rides.push({
                        vehicle: AllData.vehicles[i].vehicle,
                        ride: AllData.vehicles[i].rides[j].ride, 
                        combined5: part1 + "_5",
                        combined10: part1 + "_10",
                        combined15: part1 + "_15",
                        combined20: part1 + "_20",
                    });
                    me.status.push({
                        combined: part1,
                        rated: false
                    });  
                }
            } 
            this.filtered = this.rides;
            this.perPage = 1;
            this.currentPage = 1;
            this.fully_loaded = true;
        },
        getStatus(user_id) {
            for (let i = 0; i < this.status.length; i++) {
                if (this.status[i]["user_id"] == user_id) {
                    return this.status[i]["status"];
                }
            }
            return false;
        },
        sortByOptions() {
            return this.columns.map(({ key }) => key);
        },
        changeSelectionVehicle(new_v) {
            if (this.selected_vehicle_ix == new_v) { 
                this.selected_vehicle_ix = { "value": -1, "text": -1 }; 
            } else {
                this.selected_vehicle_ix = new_v;
            } 
        }, 
        changeSelectionRide(new_v) {
            if (this.selected_ride_ix == new_v) { 
                this.selected_ride_ix = { "value": -1, "text": -1 }; 
            } else {
                this.selected_ride_ix = new_v;
            } 
        }, 
    },
    created() {
        this.selected_vehicle_ix = this.vehicle_ix_array[0]; 
        this.selected_ride_ix = this.ride_ix_array[this.vehicle_ix_array[0].value][0]; 
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
        selected_vehicle_ix() {
            if (this.selected_vehicle_ix.value != -1) {
                this.selected_ride_ix = this.ride_ix_array[this.selected_vehicle_ix.value][0];
            } else {
                this.selected_ride_ix = { "value": -1, "text": -1 };
            }
            this.fetch_rides();
        }, 
        selected_ride_ix() {
            this.fetch_rides();
        }, 
    },
};
</script>

<template>
    <body class="my_body">
        <h4 class="display-4">
            <va-icon size="large" name="person_search"></va-icon>
            &nbsp; Pretraži vožnje
        </h4>
        <LoadingBar v-if="!fully_loaded"></LoadingBar>
        <span v-else>
            <br />
            <va-card>
                <va-card-content>
                    <h4>Vozilo 1</h4>
                    <br />
                    <va-chip style="border: none; white-space: nowrap" :outline="selected_vehicle_ix != v"
                        v-for="v in vehicle_ix_array" v-on:click="changeSelectionVehicle(v)">{{ v.text }}</va-chip>
                    <h4>Vožnja 1</h4>
                    <br />
                    <va-chip style="border: none; white-space: nowrap; width: 100px"
                        v-for="v in ride_ix_array[selected_vehicle_ix.value]" :outline="selected_ride_ix != v"
                        v-on:click="changeSelectionRide(v)">{{ v.text }}</va-chip>
                </va-card-content>
            </va-card> 
            <br />
            <span v-if="rides.length > 0">
                <div>
                    <div style="display: inline-block">
                        <MyCounter :min_value="1" :max_value="Math.ceil(this.filtered.length)" v-bind:value="perPage"
                            @input="(n) => (perPage = n)" :is_page_size="true" :some_text="'Po stranici'">
                        </MyCounter>
                    </div>
                    <div style="display: inline-block; margin-left: 10px">
                        <MyCounter :min_value="1" :max_value="Math.floor(this.filtered.length / perPage)"
                            v-bind:value="currentPage" @input="(n) => (currentPage = n)" :is_page_number="true"
                            :some_text="'Stranica'">
                        </MyCounter>
                    </div>
                </div>
                <br />
                <va-data-table :items="rides" :filter="filter" :columns="columns" :hoverable="true" :per-page="perPage"
                    :current-page="currentPage" v-model:sort-by="sortBy" v-model:sorting-order="sortingOrder"
                    @filtered="filtered = $event.items" no-data-filtered-html="Pretraga nije dala rezultate."
                    no-data-html="Nema podataka." :filter-method="customFilteringFn">
                    <template #header(vehicle)>Vozilo</template>
                    <template #header(ride)>Vožnja</template> 
                    <template #header(combined5)>Ocjeni (ws 5)</template>
                    <template #header(combined10)>Ocjeni (ws 10)</template>
                    <template #header(combined15)>Ocjeni (ws 15)</template>
                    <template #header(combined20)>Ocjeni (ws 20)</template>
                    <template #cell(combined5)="{ source: combined5 }">
                        <router-link v-bind:to="{ name: 'rate', params: { combined: combined5 } }">
                            <va-button outline :rounded="false" style="border: none"><va-icon name="star" /></va-button>
                        </router-link>  
                    </template>
                    <template #cell(combined10)="{ source: combined10 }">
                        <router-link v-bind:to="{ name: 'rate', params: { combined: combined10 } }">
                            <va-button outline :rounded="false" style="border: none"><va-icon name="star" /></va-button>
                        </router-link>  
                    </template>
                    <template #cell(combined15)="{ source: combined15 }">
                        <router-link v-bind:to="{ name: 'rate', params: { combined: combined15 } }">
                            <va-button outline :rounded="false" style="border: none"><va-icon name="star" /></va-button>
                        </router-link>  
                    </template>
                    <template #cell(combined20)="{ source: combined20 }">
                        <router-link v-bind:to="{ name: 'rate', params: { combined: combined20 } }">
                            <va-button outline :rounded="false" style="border: none"><va-icon name="star" /></va-button>
                        </router-link>  
                    </template>
                </va-data-table>
            </span>
            <NoDataToDisplay v-if="rides.length <= 0" customMessage="Nema rezultata">
            </NoDataToDisplay>
        </span>
    </body>
</template>

<style scoped></style>
