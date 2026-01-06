// src/stores/auth.ts
import { defineStore } from 'pinia';
import { apiLogout } from '@/services/authService'
import api from '@/api/axios'
import router from '@/router';
import {ElNotification} from 'element-plus'

interface User {
  id: number;
  name: string;
  email: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
	token: localStorage.getItem('token') || null,
  }),
  actions: {
    setUser(user: User) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
	setToken(token: string) {
		this.token = token
		localStorage.setItem('token', token);
		// 设置请求头（同步更新 axios 实例）
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	},
    async logout(skipAip = false) {
		try{
			if(!skipAip) {
				await apiLogout()
			}
		} catch (error) {
			console.error('退出登录API请求失败', error);	
		} finally{
			this.user = null;
			this.token = null
			localStorage.removeItem('user');
			localStorage.removeItem('token');
			// 清除 axios 请求头中的token
			delete api.defaults.headers.common['Authorization']
			// 提示退出成功
			ElNotification.success({
				title: '通知',
				message: '退出成功！',
				offset:100,
			})
			if(router.currentRoute.value.path !== '/login'){
				router.push('/login')
			}
		}
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user && !! state.token,
  },
});