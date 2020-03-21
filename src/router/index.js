import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // component: () => import(/* webpackChunkName: "secondary" */ '../quick-cam/Layout/IceCreamLayout.vue')
    component: () => import('../lok-gl/Layout/HomePageLayout.vue')
  },
  {
    path: '/ice-cream',
    // component: () => import(/* webpackChunkName: "secondary" */ '../quick-cam/Layout/IceCreamLayout.vue')
    component: () => import('../lok-gl/Layout/IceCreamLayout.vue')
  }
]

if (process.env.NODE_ENV === 'development') {
  routes.unshift({
    path: '/ui',
    component: () => import('../human/server-ui/TuneUI.vue')
  })
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
