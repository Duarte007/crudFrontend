import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import VueRouter from 'vue-router';
import Product from './components/Products.vue';
import Store from './components/Stores.vue';
import Warehouse from './components/Warehouses.vue';

Vue.use(VueRouter)
Vue.use(Antd)
Vue.use(VueAxios, axios);

const routes = [
  { path: '/', redirect: '/products' },
  { path: '/products', component: Product },
  { path: '/stores', component: Store },
  { path: '/warehouses', component: Warehouse }
];

const router = new VueRouter({
  routes
});

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
