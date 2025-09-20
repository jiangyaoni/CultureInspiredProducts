import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import Home from '@/views/main/HomePage.vue'
import Heritage from '@/views/main/HeritageLibrary.vue'
import Cultural from '@/views/main/CulturalShop.vue'
import Shopping from '@/views/main/ShoppingCart.vue'
import Favorites from '@/views/main/UserFavorites.vue'
import Personal from '@/views/main/PersonalCenter.vue'
import Register from '@/views/auth/Register.vue'
import ForgotPassword from '@/views/auth/ForgotPassword​.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/login/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/login/forgotPassword',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/heritage',
    name: 'Heritage',
    component: Heritage,
  },
  {
    path: '/cultural',
    name: 'Cultural',
    component: Cultural,
  },
  {
    path: '/shopping',
    name: 'Shopping',
    component: Shopping,
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
  },
  {
    path: '/personal',
    name: 'Personal',
    component: Personal,
  },
  {
    path: '/heritage/:id',
    name: 'HeritageInfo',
    component: () => import('@/views/main/HeritageInfo.vue'),
  },
  {
    path: '/cultural/:id',
    name: 'ProductDetail',
    component: () => import('@/views/main/ProductDetail.vue'),
  },
  {
    path: '/cultural/:id/purchase',
    name: 'ProductPurchase',
    component: () => import('@/views/main/ProductPurchase.vue'),
  },
  {
    path: '/shopping/checkout',
    name: 'CartCheckout',
    component: () => import('@/views/main/CartCheckout.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cultural/:id/purchase',
    name: 'ProductPurchase',
    component: () => import('@/views/main/ProductPurchase.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/order/:id/payment-result',
    name: 'PaymentResult',
    component: () => import('@/views/main/PaymentResult.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
