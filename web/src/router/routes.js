const routes = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('pages/Index.vue')
  },
  {
    path: '/home',
    component: () => import('pages/Index.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
        path: 'auto',
        component: () => import('pages/Auto.vue')
      },
      {
        path: 'local',
        component: () => import('pages/Local.vue')
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
