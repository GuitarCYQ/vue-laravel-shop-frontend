import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuard } from './routerGuard'

// 移除所有静态导入的组件，改为路由配置内的动态导入

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      // 懒加载：访问 /login 时才加载该组件
      component: () => import('../views/Login/EmailLogin.vue'),
      meta: { requireAuth: false, title: '登录' }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { requireAuth: true, title: '主页' } // 需要登陆后才能看到
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart/Cart.vue'),
      meta: { requireAuth: true, title: '购物车' } // 需要登陆后才能看到
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: () => import('../views/Check/Checkout.vue'),
      meta: { requireAuth: true, title: '结算' } // 需要登陆后才能看到
    },
    {
      path: '/pay/:id',
      name: 'Pay',
      component: () => import('../views/Check/pay.vue'),
      meta: { requireAuth: true, title: '支付' }, // 需要登陆后才能看到
    },
    {
      path: '/payment/alipay/return',
      name: 'PaymentSuccess',
      component: () => import('../views/Check/PaymentSuccess.vue'),
      meta: { requireAuth: true, title: '支付回调' }, // 需要登陆后才能看到
    },
    {
      path: '/user',
      name: 'UserCenter',
      component: () => import('../views/User/UserCenter.vue'),
      meta: { requireAuth: true, title: '用户中心' }, // 需要登陆后才能看到
    },
    {
      path: '/user/addresses',
      name: 'UserAddresses',
      component: () => import('../views/User/UserAddresses.vue'),
      meta: { requireAuth: true, title: '收货地址' } // 需要登陆后才能看到
    },
    // 补充你之前新增的 我的优惠券/我的收藏 懒加载路由
    {
      path: '/user/coupons',
      name: 'Coupons',
      component: () => import('../views/User/UserCoupons.vue'),
      meta: { requireAuth: true, title: '我的优惠券' }
    },
    {
      path: '/user/favorites',
      name: 'Favorites',
      component: () => import('../views/User/UserFavorites.vue'),
      meta: { requireAuth: true, title: '我的收藏' }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Order/Orders.vue'),
      meta: { requireAuth: true, title: '我的订单' } // 需要登陆后才能看到
    },
    {
      path: '/order/:id',
      name: 'OrderDetail',
      component: () => import('../views/Order/OrderDetail.vue'),
      meta: { requireAuth: true, title: '订单详情' } // 需要登陆后才能看到
    },
    {
      path: '/orders/review/',
      name: 'OrderReview',
      component: () => import('../views/Order/OrderReview.vue'),
      meta: { requireAuth: true, title: '订单评价' } // 需要登陆后才能看到
    },
    {
      path: '/list',
      name: 'List',
      component: () => import('../views/Product/ProductList.vue'),
      meta: { requireAuth: false, title: '列表' }
    },
    {
      path: '/detail/:id',
      name: 'Detail',
      component: () => import('../views/Product/ProductDetail.vue'),
      meta: { requireAuth: false, title: '详情页' }
    },
    {
      path: '/new',
      name: 'New',
      component: () => import('../views/NewArrivals.vue'),
      meta: { requireAuth: true, title: '新品' } // 需要登陆后才能看到
    },
    // 补充你原代码里的 AlipayReturn 路由（之前漏写，已补全）
    {
      path: '/payment/alipay/return',
      name: 'AlipayReturn',
      component: () => import('../views/Check/AlipayReturn.vue'),
      meta: { requireAuth: true, title: '支付宝回调' }
    }
  ],
})

// 路由守卫：未登录用户跳转至登录页面
setupRouterGuard(router)

export default router