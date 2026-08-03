import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

function mapRoleToRouteGroups(role?: string): string[] {
  if (!role) return []

  if (role === 'System Administrator' || role === 'Company Administrator') {
    return ['Admin']
  }

  if (
    role === 'Support Agent' ||
    role === 'IT Support Agent' ||
    role === 'Senior Agent' ||
    role === 'IT Manager' ||
    role === 'CISO / ISB' ||
    role === 'Security Manager'
  ) {
    return ['Agent']
  }

  if (role === 'Employee') {
    return ['Employee']
  }

  return []
}

export function getDashboardRouteName(role?: string): string {
  const groups = mapRoleToRouteGroups(role)
  if (groups.includes('Admin')) return 'admin.dashboard'
  if (groups.includes('Agent')) return 'agent.dashboard'
  return 'employee.dashboard'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/dashboard/DashboardRouter.vue')
        },
        {
          path: 'employee/dashboard',
          name: 'employee.dashboard',
          component: () => import('../views/employee/EmployeeDashboardView.vue'),
          meta: { roles: ['Employee'] }
        },
        {
          path: 'employee/tickets',
          name: 'employee.tickets',
          component: () => import('../views/employee/EmployeeTicketsView.vue'),
          meta: { roles: ['Employee'] }
        },
        {
          path: 'employee/tickets/new',
          name: 'employee.ticket.create',
          component: () => import('../views/employee/EmployeeCreateTicketView.vue'),
          meta: { roles: ['Employee'] }
        },
        {
          path: 'employee/tickets/:id',
          name: 'employee.ticket.detail',
          component: () => import('../views/employee/EmployeeTicketDetailView.vue'),
          meta: { roles: ['Employee'] }
        },
        // Agent Routes
        {
          path: 'agent/dashboard',
          name: 'agent.dashboard',
          component: () => import('../views/agent/AgentDashboardView.vue'),
          meta: { roles: ['Agent', 'Admin'] }
        },
        {
          path: 'agent/tickets',
          name: 'agent.tickets',
          component: () => import('../views/agent/AgentTicketsView.vue'),
          meta: { roles: ['Agent', 'Admin'] }
        },
        {
          path: 'agent/tickets/:id',
          name: 'agent.ticket.detail',
          component: () => import('../views/agent/AgentTicketDetailView.vue'),
          meta: { roles: ['Agent', 'Admin'] }
        },
        // Admin Routes
        {
          path: 'admin/dashboard',
          name: 'admin.dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/reports',
          name: 'admin.reports',
          component: () => import('../views/admin/AdminReportsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/sla-policies',
          name: 'admin.slas',
          component: () => import('../views/admin/AdminSLAPoliciesView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/tickets',
          name: 'admin.tickets',
          component: () => import('../views/admin/AdminTicketsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/users',
          name: 'admin.users',
          component: () => import('../views/admin/AdminUsersView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/roles',
          name: 'admin.roles',
          component: () => import('../views/admin/AdminRolesView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/assets',
          name: 'admin.assets',
          component: () => import('../views/admin/AdminAssetsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/departments',
          name: 'admin.departments',
          component: () => import('../views/admin/AdminDepartmentsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/categories',
          name: 'admin.categories',
          component: () => import('../views/admin/AdminCategoriesView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/settings',
          name: 'admin.settings',
          component: () => import('../views/admin/AdminSettingsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/licenses',
          name: 'admin.licenses',
          component: () => import('../views/admin/AdminLicensesView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/audit-logs',
          name: 'admin.audit',
          component: () => import('../views/admin/AdminAuditLogsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/integrations',
          name: 'admin.integrations',
          component: () => import('../views/admin/AdminIntegrationsView.vue'),
          meta: { roles: ['Admin'] }
        },
        {
          path: 'admin/announcements',
          name: 'admin.announcements',
          component: () => import('../views/admin/AdminAnnouncementsView.vue'),
          meta: { roles: ['Admin'] }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const requiredRoles = (to.meta.roles as string[] | undefined) || []

  // If a token exists after refresh, hydrate user before role checks.
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.checkSession()
  }

  const userRoleGroups = mapRoleToRouteGroups(authStore.user?.role)
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (requiredRoles.length > 0 && !requiredRoles.some(role => userRoleGroups.includes(role))) {
    next({ name: getDashboardRouteName(authStore.user?.role) })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: getDashboardRouteName(authStore.user?.role) })
  } else if (to.name === 'dashboard') {
    // Explicitly redirect the raw /dashboard to the specific role route
    next({ name: getDashboardRouteName(authStore.user?.role) })
  } else {
    next()
  }
})

export default router
