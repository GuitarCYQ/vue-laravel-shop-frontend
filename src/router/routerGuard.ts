// routerGuard.ts
import type { Router } from 'vue-router'; // 使用 type 关键字导入类型
import { useAuthStore } from '../stores/auth';

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, _, next) => {
    const authStore = useAuthStore();
    if (to.meta.requireAuth && !authStore.isLoggedIn) {
      next({ path: '/login' });
    } else {
      next();
    }
  });
}