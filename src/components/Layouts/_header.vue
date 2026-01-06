<template>
	<!-- 导航栏 -->
	<header class="navbar">
	  <div class="container">
	    <div class="navbar-content">
	      <!-- Logo -->
	      <div class="logo">
	        <a href="/">
	          <h1 class="text-2xl font-bold text-primary">MallShop</h1>
	        </a>
	      </div>
		
	      <!-- 导航菜单 - 桌面端 -->
		  <slot name="nav"></slot>
	      <!-- <nav class="main-nav hidden md:flex">
	        <ul class="nav-list">
	          <li class="nav-item"><router-link to="/" >首页</router-link></li>
	          <li class="nav-item"><a @click="goType('')" :class="{ active: currentType === ''} ">分类</a></li>
	          <li class="nav-item"><a @click="goType('new')" :class="{ active: currentType === 'new'}" >新品</a></li>
	          <li class="nav-item"><a  @click="goType('hot')" :class="{ active: currentType === 'hot'}" >热门</a></li>
	          <li class="nav-item"><a  @click="goType('discount')" :class="{ active: currentType === 'discount'}" >优惠</a></li>
	        </ul>
	      </nav> -->
	
	      <!-- 功能按钮区 -->
	      <!-- <slot name="icon"></slot> -->
		  <div class="nav-actions">
		    <button class="action-btn search-btn" @click="clickSearch">
		      <i class="icon-search"></i>
		    </button>
		    <button class="action-btn cart-btn" @click="$router.push('/cart')">
		      <i class="icon-cart"></i>
		      <span class="cart-count">{{ cartStore.totalCount }}</span>
		    </button>
			<!-- 修改用户按钮为下拉菜单 -->
			  <div class="user-menu">
			    <button class="action-btn user-btn" @click="showUserMenu = !showUserMenu" >
			      <i class="icon-user"></i>
			      <!-- 显示用户名（如果已登录） -->
			      <!-- <span class="user-name" v-if="user">{{ user.name || user.email.split('@')[0] }}</span> -->
			    </button>
			    
			    <!-- 用户下拉菜单 -->
			    <div class="user-dropdown" v-if="showUserMenu">
			      <ul>
			        <li @click="goUserCenter">
			          <i class="icon-user-center"></i> 个人中心
			        </li>
			        <li @click="logout">
			          <i class="icon-logout"></i> 退出登录
			        </li>
			      </ul>
			    </div>
			  </div>
		    <!-- <button class="action-btn user-btn" @click="$router.push('/user')">
		      <i class="icon-user"></i>
		    </button> -->
		  </div>
	    </div>
	  </div>
	
	  <!-- 搜索框 (点击搜索按钮显示) -->
	  <div class="search-box" v-if="showSearch">
	    <div class="container">
			<!-- 
				@blur 失去焦点是通知关闭
				autofocus 显示时自动聚焦
				keyup.enter 敲下回车后触发
			 -->
	      <input 
	        type="text" 
	        placeholder="按下回车进行搜索" 
	        class="search-input"
			v-model="searchStore.searchQuery"
	        @blur="handleBlur"
			@keyup.enter="handleSearch"
			:autofocus="showSearch"
	      >
		  <button v-if="searchStore.searchQuery" class="search" @click="cleanSearch">
			<i class="icon-close"></i>
		  </button>
	    </div>
	  </div>
	
	  <!-- 移动端菜单 (点击菜单按钮显示) -->
	  <div class="mobile-menu" v-if="showMobileMenu">
	    <div class="mobile-menu-content">
	      <button class="menu-close" @click="$emit('update:showMobileMenu', false)">
	        <i class="icon-close"></i>
	      </button>
	      <slot name="mobile-nav"></slot>
	    </div>
	  </div>
	</header>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, computed } from 'vue';
import {useSearchStore} from '@/stores/searchStore';
import {useRoute, useRouter} from 'vue-router';
import {useCartStore} from '@/stores/cartStore';
import { useAuthStore } from '@/stores/auth';
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// 实例化Store
const searchStore = useSearchStore();
const showSearch = ref(false)
const showMobileMenu = ref(false)
// 点击搜索按钮
const clickSearch = () => {
	showSearch.value = !showSearch.value
	if (showSearch.value) {
		searchStore.setSearchQuery('') // 打开搜索框时清空历史搜索词
	}
}

// 个人中心相关
const showUserMenu = ref(false)
// 去个人中心
const goUserCenter = () => {
	router.push('/user')
}

// 退出登录
const logout = () => {
	// 调用 authStore 的logout 方法清除用户信息和token
	authStore.logout();
}
	
// // 接收外部传入的状态 搜索框showSearch和移动端显示按钮showMobileMenu
// const props = defineProps({
// 	showSearch:{
// 		type: Boolean,
// 		default: false,
// 	},
// 	showMobileMenu: {
// 		type: Boolean,
// 		default: false,
// 	},
// })

// // 定义事件，传递数据给父组件
// const emit = defineEmits([
// 	'update:showSearch', 
// 	'update:showMobileMenu',
// ])

 
// 触发搜索
const handleSearch = () => {
	const query = searchStore.searchQuery.trim()
	console.log(query,'aaa1')
	if (query) {
		searchStore.setSearchQuery(query) // 调用全局搜索
		searchStore.fetchProducts()
	}
}
// 清空搜索词，并且搜索全部
const cleanSearch = () => {
	searchStore.cleanSearch()
	// emit('update:showSearch', false)
	showSearch.value = false
}

// 处理失去焦点（延迟关闭，避免点击按钮时立即关闭）
const handleBlur = () => {
	// setTimeout(() => {
	// 	emit('update:showSearch', false)
	// }, 200)
}

// 计算当前类型：优先取路由参数 t，首页无参数时为 undefined
// const currentType = computed(() => {
//   // 处理首页的情况：当路由是 '/' 时，currentType 设为 ''，确保分类按钮激活
//   if (route.path === '/') {
//     return null;
//   }
//   // 其他页面取 query.t 的值（new/hot/discount）
//   return (route.query.t as string) || '';
// });

const goType = (type: string) => {
	console.log(type)
	router.push({
		name: 'List',
		query: {
			t: type
		}
	})
}

</script>

<style scoped>
	@import '@/assets/css/common/common.scss';

</style>