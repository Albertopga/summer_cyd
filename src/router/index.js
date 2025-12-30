import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegistrationView from '../views/RegistrationView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/registration',
      name: 'registration',
      component: RegistrationView,
    },
    {
      path: '/politica-privacidad',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    // {
    //   path: '/home1',
    //   name: 'home1',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../components/Home1.vue'),
    // },
    // {
    //   path: '/home2',
    //   name: 'home2',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../components/Home2.vue'),
    // },
  ],
})

export default router
