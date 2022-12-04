import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
// import Home from '../views/Results.vue'
import VotingComponent from '../views/Voting.vue'
// import JuryVotingComponent from '../views/JuryVoting.vue'
// import ResultsComponent from '../views/Results.vue'
// import RegisterComponent from '../views/Register.vue'
// import AdminComponent from '../views/Admin.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: VotingComponent
  },
  {
    path: '/vote',
    name: 'Glasuj',
    component: VotingComponent
  },
  // {
  //   path: '/results',
  //   name: 'Rezultati',
  //   component: ResultsComponent
  // },
  {
    path: '/jury',
    name: 'Glasovanje žirije',
    // component: JuryVotingComponent
    component: () => import(/* webpackChunkName: "jury" */ '../views/JuryVoting.vue')
  },

  {
    path: '/prijava',
    name: 'Prijavi se',
    // component: RegisterComponent
    component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue')
  },
  {
    path: '/admin',
    name: 'Administracija',
    // component: AdminComponent
    component: () => import(/* webpackChunkName: "admin" */ '../views/Admin.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
