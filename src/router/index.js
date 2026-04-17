import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegistrationView from '../views/RegistrationView.vue'
import ActivityRegistrationView from '../views/ActivityRegistrationView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import RulesView from '../views/RulesView.vue'
import FAQView from '../views/FAQView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { pageTitle: 'Inicio' },
    },
    {
      path: '/registration',
      name: 'registration',
      component: RegistrationView,
      meta: {
        pageEyebrow: 'Inscripción',
        pageTitle: 'Inscripciones',
        backTo: '/',
        backLabel: 'Inicio',
        backAriaLabel: 'Volver al inicio',
      },
    },
    {
      path: '/actividades',
      name: 'activity-registration',
      component: ActivityRegistrationView,
      meta: {
        pageEyebrow: 'Organización de actividades',
        pageTitle: 'Registro de Actividades',
        backTo: '/registration',
        backLabel: 'Inscripción',
        backAriaLabel: 'Volver al formulario de inscripción',
      },
    },
    {
      path: '/politica-privacidad',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: { pageEyebrow: 'Información legal', pageTitle: 'Política de Privacidad' },
    },
    {
      path: '/normas',
      name: 'rules',
      component: RulesView,
      meta: { pageEyebrow: 'Información del evento', pageTitle: 'Normas del Evento' },
    },
    {
      path: '/faqs',
      name: 'faqs',
      component: FAQView,
      meta: { pageEyebrow: 'Ayuda', pageTitle: 'Preguntas Frecuentes' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { pageTitle: 'Administración' },
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
  scrollBehavior(to, from, savedPosition) {
    // Si hay una posición guardada (por ejemplo, al usar el botón atrás del navegador),
    // restaurarla
    if (savedPosition) {
      return savedPosition
    }
    // Si hay un hash en la URL, hacer scroll a ese elemento
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // Por defecto, hacer scroll al inicio de la página
    return {
      top: 0,
      left: 0,
      behavior: 'smooth',
    }
  },
})

export default router
