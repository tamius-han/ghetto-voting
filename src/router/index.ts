import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import VotingComponent from '../views/Voting.vue'
import HomeComponent from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeComponent,
  },
  {
    path: '/vote/:contestId',
    name: 'Glasuj',
    component: VotingComponent,
    props: true
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
