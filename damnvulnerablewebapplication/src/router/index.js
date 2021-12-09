import Vue from "vue";
import VueRouter from "vue-router";
import Product from "@/components/Product";


Vue.use(VueRouter)

export const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/product',
            name: 'Product',
            component: Product,
            meta:{title: 'Product-Page'}
        }
    ]
});

export default router


// Add a 401 response interceptor
