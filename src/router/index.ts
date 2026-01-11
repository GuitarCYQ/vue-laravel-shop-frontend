import { createRouter, createWebHistory  } from 'vue-router'
import EmailLogin from '../views/Login/EmailLogin.vue'
import Home from '../views/Home.vue'
import Cart from '../views/Cart/Cart.vue'
import Checkout from '../views/Check/Checkout.vue'
import Pay from '../views/Check/pay.vue'
import PaymentSuccess from '../views/Check/PaymentSuccess.vue'
import AlipayReturn from '../views/Check/AlipayReturn.vue'
import Detail from '../views/Product/ProductDetail.vue'
import UserCenter from '../views/User/UserCenter.vue'
import UserAddresses from '../views/User/UserAddresses.vue'
import Orders from '../views/Order/Orders.vue'
import OrderDetail from '../views/Order/OrderDetail.vue'
import OrderReview from '../views/Order/OrderReview.vue'
import ProductList from '../views/Product/ProductList.vue'
import New from '../views/NewArrivals.vue'
import { setupRouterGuard } from './routerGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
	{
		path: '/login',
		name: 'Login',
		component: EmailLogin,
		meta: { requireAuth: false, title:'登录' }
	},
    {
      path: '/',
      name: 'Home',
      component: Home,
	  meta: { requireAuth: true, title:'主页' }, // 需要登陆后才能看到
	
    }, 
	{
      path: '/cart',
      name: 'Cart',
      component: Cart,
	  meta: { requireAuth: true, title:'购物车' } // 需要登陆后才能看到
    },
	{
	  path: '/checkout',
	  name: 'Checkout',
	  component: Checkout,
	  meta: { requireAuth: true, title:'结算' } // 需要登陆后才能看到
	},
	{
	  path: '/pay/:id',
	  name: 'Pay',
	  component: Pay,
	  meta: { requireAuth: true, title:'支付' }, // 需要登陆后才能看到
	},
	{
	  path: '/payment/alipay/return',
	  name: 'PaymentSuccess',
	  component: PaymentSuccess,
	  meta: { requireAuth: true, title:'支付回调' }, // 需要登陆后才能看到
	},
	{
	  path: '/user',
	  name: 'UserCenter',
	  component: UserCenter,
	  meta: { requireAuth: true, title:'用户中心' }, // 需要登陆后才能看到
	},
	{
	  path: '/user/addresses',
	  name: 'UserAddresses',
	  component: UserAddresses,
	  meta: { requireAuth: true, title:'收货地址' } // 需要登陆后才能看到
	},
	{
	  path: '/orders',
	  name: 'Orders',
	  component: Orders,
	  meta: { requireAuth: true, title:'我的订单' } // 需要登陆后才能看到
	},
	{
	  path: '/order/:id',
	  name: 'OrderDetail',
	  component: OrderDetail,
	  meta: { requireAuth: true, title:'订单详情' } // 需要登陆后才能看到
	},
		{
	  path: '/orders/review/',
	  name: 'OrderReview',
	  component: OrderReview,
	  meta: { requireAuth: true, title:'订单评价' } // 需要登陆后才能看到
	},
	{
	  path: '/list',
	  name: 'List',
	  component: ProductList,
	  meta: { requireAuth: false, title:'列表' }
	},
	{
	  path: '/detail/:id',
	  name: 'Detail',
	  component: Detail,
	  meta: { requireAuth: false, title:'详情页' }
	},
	{
	  path: '/new',
	  name: 'New',
	  component: New,
	  meta: { requireAuth: true, title:'新品' } // 需要登陆后才能看到
	},
  ],
})

// 路由守卫：未登录用户跳转至登录页面
setupRouterGuard(router)

export default router
