import './assets/main.css'
import 'bootstrap'

import 'bootstrap/dist/css/bootstrap.css'
import { BootstrapIconsPlugin } from "bootstrap-icons-vue";

import { createApp } from 'vue'
import App from './App.vue' 

createApp(App).use(BootstrapIconsPlugin).mount('#app')
