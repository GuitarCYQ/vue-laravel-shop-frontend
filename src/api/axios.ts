// 封装axios

import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'; // 
import { useAuthStore } from '../stores/auth';
import router from '../router'; // 引入路由实例

const isLocal = false
let baseURL 
if (isLocal) {
	baseURL = 'http://larabbs.test/api'
} else {
	baseURL = 'http://103.242.14.249/api'
	// baseURL = 'http://222.186.21.30:8988/api'
}

const api = axios.create({
  // baseURL: 'https://7dac4f3cb204.ngrok-free.app/api',
  baseURL,
  withCredentials: true,
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
  },
});
// 请求拦截
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
	// ✅ ✅ ✅ 核心新增：强制删除这个请求头（无论谁注入的，一律删掉）
	if (config.headers) {
	  delete config.headers['ngrok-skip-browser-warning'];
	}
	  
    const token = localStorage.getItem('token');
    if (token) {
		config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（修改 401 错误处理逻辑��?
api.interceptors.response.use(
  (response: AxiosResponse) => {
	return response;
  },
  (error) => {

    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      const currentPath = router.currentRoute.value.path; // 获取当前路由路径

      
	  if (authStore.isLoggedIn) { 
		localStorage.removeItem('token');
		  authStore.logout(true);
	  }

      // 2. 仅在非登录页时跳转（避免登录页重复跳转导致刷新）
      if (currentPath !== '/login') {
        // 使用路由跳转替代 window.location.href    
		router.push('/login');
      }
    }
    return Promise.reject(error); // 将错误抛回给组件处理
  }
);
export default api;
