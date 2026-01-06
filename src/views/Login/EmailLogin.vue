<template>
  <div class="fullscreen-login">
    <!-- 左侧品牌区 -->
    <div class="login-brand">
      <div class="brand-content">
        <h1 class="brand-logo">MyApp</h1>
        <p class="brand-slogan">高效、安全的企业级应用平台</p>
        <div class="brand-image">
          <img src="https://picsum.photos/id/1/600/400" alt="品牌展示" />
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-form-container">
      <div class="form-wrapper">
        <h2 class="login-title">欢迎回来</h2>
        
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: loginMethod === 'code' }"
            @click="switchLoginMethod('code')"
          >
            验证码登录
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: loginMethod === 'password' }"
            @click="switchLoginMethod('password')"
          >
            密码登录
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 邮箱输入框（两种登录方式共用） -->
          <div class="form-group">
            <label for="email" class="form-label">{{ loginMethod==='code' ? '邮箱' : '用户名'}}</label>
            <div class="input-group">
              <i class="icon icon-email"></i>
              <input
                type="email"
                id="email"
                v-model="form.email"
                :placeholder="loginMethod==='code' ? '请输入您的邮箱' : '请输入您的邮箱或手机'"
                required
                class="form-input"
                @input="validateEmail"
              >
            </div>
            <p class="field-error" v-if="emailError">{{ emailError }}</p>
          </div>

          <!-- 动态显示验证码或密码输入框 -->
          <template v-if="loginMethod == 'code'">
            <!-- 验证码输入框 + 发送按钮 -->
            <div class="form-group">
              <label for="code" class="form-label">验证码</label>
              <div class="input-group code-group">
                <i class="icon icon-code"></i>
                <input
                  type="text"
                  id="code"
                  v-model="form.code"
                  placeholder="请输入6位验证码"
                  maxlength="6"
                  required
                  class="form-input code-input"
                  :disabled="!canInputCode"
                >
                <button
                  type="button"
                  @click="handleSendCode"
                  :disabled="!canSendCode || isSending"
                  class="send-btn"
                >
                  {{ isSending ? `${countdown}秒后重发` : '发送验证码' }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="loginMethod == 'password'">
            <!-- 密码输入框 -->
            <div class="form-group">
              <label for="password" class="form-label">密码</label>
              <div class="input-group">
                <i class="icon icon-password"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  placeholder="请输入密码"
                  required
                  class="form-input"
                  @input="validatePassword"
                >
                <button 
                  type="button" 
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <p class="field-error" v-if="passwordError">{{ passwordError }}</p>
            </div>

            <!-- 记住密码和忘记密码 -->
            <div class="password-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe">
                记住我
              </label>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>
          </template>

          <!-- 错误提示 -->
          <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>

          <!-- 登录按钮 -->
          <button type="submit" class="login-btn" :disabled="isLoading || !canLogin">
            <span v-if="!isLoading">登录</span>
            <span v-if="isLoading" class="loading-spinner">●●●</span>
          </button>

          <!-- 其他登录方式 -->
          <div class="other-login-methods">
            <div class="separator">
              <span class="line"></span>
              <span class="text">其他登录方式</span>
              <span class="line"></span>
            </div>
            
            <!-- 微信登录按钮 -->
            <button 
              type="button" 
              class="wechat-login-btn"
              @click="handleWechatLogin"
              :disabled="isLoading"
            >
              <i class="icon icon-wechat"></i>
              <span>微信登录</span>
            </button>
          </div>

          <!-- 辅助链接 -->
          <div class="login-links">
            <a href="#" class="link">忘记邮箱？</a>
            <a href="#" class="link">企业登录</a>
          </div>
        </form>
      </div>
    </div>

    <!-- 图片验证码弹窗 -->
    <div class="modal-overlay" v-if="showCaptchaModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">验证图片验证码</h3>
          <button class="modal-close" @click="closeCaptchaModal">×</button>
        </div>
        <div class="modal-body">
          <div class="captcha-group">
            <img 
              :src="captchaImage" 
              alt="图片验证码" 
              class="captcha-image"
              @click="refreshCaptcha"
            >
            <button class="refresh-btn" @click="refreshCaptcha">换一张</button>
          </div>
          <div class="input-group captcha-input-group">
            <i class="icon icon-captcha"></i>
            <input
              type="text"
              v-model="captchaCode"
              placeholder="请输入图片中的验证码"
              maxlength="5"
              class="form-input captcha-input"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button"
            class="modal-btn cancel-btn" 
            @click="closeCaptchaModal"
          >
            取消
          </button>
          <button 
            type="button"
            class="modal-btn confirm-btn" 
            @click.prevent.stop="verifyCaptcha"
            :disabled="!captchaCode || isVerifying"
          >
            <span v-if="!isVerifying">确认</span>
            <span v-if="isVerifying" class="loading-spinner">●●●</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onUnmounted, computed } from 'vue';
import { ElNotification, ElLoading } from 'element-plus';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
import api from '@/api/axios'
import { apiGetCaptcha, apiGetCode, apiLoginWithEmail, apiLoginWithPassword} from '@/services/authService'


// 表单数据扩展，增加密码字段
interface LoginForm {
  email: string;
  code: string;
  password: string; // 新增密码字段
}
const form = reactive<LoginForm>({
  email: '',
  code: '',
  password: '', // 初始化密码字段
});

// 新增：登录方式切换相关
const loginMethod = ref<'code' | 'password'>('code'); // 默认验证码登录

// 新增：密码登录相关状态
const showPassword = ref(false);
const rememberMe = ref(false);
const passwordError = ref('');

// 原有状态保持不变
const authKey = ref('');
const isSending = ref(false);
const countdown = ref(60);
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();
const authStore = useAuthStore();
let timer: number | null = null;

// 图片验证码相关状态
const showCaptchaModal = ref(false);
const captchaImage = ref('');
const captchaCode = ref('');
const captchaKey = ref('');
const isVerifying = ref(false);
const emailError = ref('');

// 验证邮箱格式（保持不变）
const validateEmail = () => {
  if(loginMethod.value === 'code') {
	  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	  if (form.email && !emailRegex.test(form.email)) {
	    emailError.value = '请输入有效的邮箱地址';
	  } else {
	    emailError.value = '';
	  }
  }
};

// 新增：验证密码
const validatePassword = () => {
  if (form.password.length > 0 && form.password.length < 6) {
    passwordError.value = '密码长度不能少于6位';
  } else {
    passwordError.value = '';
  }
};

// 新增：切换登录方式
const switchLoginMethod = (method: 'code' | 'password') => {
  loginMethod.value = method;
  console.log(loginMethod.value)
  errorMessage.value = ''; // 切换时清空错误信息
};

// 计算属性 - 控制按钮状态（扩展适配密码登录）
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(form.email);
});

const canSendCode = computed(() => {
  return isEmailValid.value && !isSending.value;
});

const canInputCode = computed(() => {
  return !!captchaKey.value;
});

// 新增：密码登录的验证条件
const isPasswordValid = computed(() => {
  return form.password.length >= 6;
});

// 调整：登录按钮状态判断
const canLogin = computed(() => {
  if (!isEmailValid.value) return false;
  
  // 根据登录方式判断
  if (loginMethod.value === 'code') {
    return !!form.code && form.code.length === 6;
  } else {
    return isPasswordValid.value;
  }
});

// 处理发送验证码（保持不变）
const handleSendCode = () => {
  if (isEmailValid.value) {
    if (!captchaImage.value) {
      getCaptcha();
    }
  }
};

// 获取图片验证码（保持不变）
const getCaptcha = async () => {
	const loading = ElLoading.service({
		lock: true,
		text: '加载中...',
		background: 'rgba(255, 255, 255, 0.7)'
	})
  try {
    const { data } = await apiGetCaptcha({
      email: form.email
    });
    captchaImage.value = data.captcha_image_content;
    captchaKey.value = data.captcha_key;
    showCaptchaModal.value = true;
	loading.close()
  } catch (error: any) {
    errorMessage.value = '获取图片验证码失败，请重试';
    console.error('获取图片验证码失败:', error);
  }
};

// 刷新图片验证码（保持不变）
const refreshCaptcha = () => {
  captchaCode.value = '';
  getCaptcha();
};

// 验证图片验证码（保持不变）
const verifyCaptcha = async () => {
  console.log('开始验证图片验证码');
  if (!captchaCode.value) {
    errorMessage.value = '请输入图片验证码';
    return;
  }

  try {
    isVerifying.value = true;
    const response = await apiGetCode({
      captcha_key: captchaKey.value,
      captcha_code: captchaCode.value,
      email: form.email
    });
    
    ElMessageBox.confirm('验证码验证成功，邮件已发送','成功',{
      confirmButtonText:'确认',
      showCancelButton:false,
      type:'success'
    });
    
    authKey.value = response.data.key

    showCaptchaModal.value = false;
    captchaCode.value = '';
    isSending.value = true;
    startCountdown();
    errorMessage.value = '';

  } catch (error: any) {
    isVerifying.value = false;

    if (error.response?.status === 401) {
      ElMessageBox.confirm('图片验证码错误，请重新输入','提示',{
        confirmButtonText:'确认',
        showCancelButton:false,
        type:'warning'
      });
      refreshCaptcha();
      return;
    }

    if (error.response?.status === 403) {
      ElMessageBox.alert('图片验证码已过期，请重新获取','提示',{
        confirmButtonText:'OK',
        showCancelButton:false,
        type:'warning'
      });
      refreshCaptcha();
      return;
    }

    ElMessageBox.alert('验证失败，请稍后重试','提示',{
      confirmButtonText:'OK',
      showCancelButton:false,
      type:'warning'
    });
  }
};

// 倒计时逻辑（保持不变）
const startCountdown = () => {
  countdown.value = 60;
  timer = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer as number);
      isSending.value = false;
    }
  }, 1000);
};

// 关闭验证码弹窗（保持不变）
const closeCaptchaModal = () => {
   showCaptchaModal.value = false;
   captchaCode.value = '';
   errorMessage.value = '';
   captchaImage.value = ''; // 新增：清空验证码图片地址
   captchaKey.value = ''; // 新增：清空验证码key
   console.log(showCaptchaModal.value);
};

// 调整：登录逻辑，根据登录方式调用不同API
const handleLogin = async () => {
  try {
    isLoading.value = true;
    let response;
    
    // 根据登录方式调用不同的API
    if (loginMethod.value === 'code') {
      // 验证码登录（原有逻辑）
      response = await apiLoginWithEmail({
        email: form.email,
        code: form.code,
        key: authKey.value
      });
    } else {
      // 新增：密码登录
      response = await apiLoginWithPassword({
        username: form.email,
        password: form.password,
      });
    }

    // 登录成功处理
    const { token, user } = response.data.data;
	console.log('token',token,user)
    authStore.setToken(token)
    authStore.setUser(user);
    
    // 如果勾选记住我，可将token存储在更持久的位置
    if (rememberMe.value) {
      localStorage.setItem('rememberedToken', token);
    }
	// 通知
    ElNotification.success({
    	title: '通知',
    	message: '登录成功！',
    	offset:100,
	
    })
    router.push('/');
  } catch (error: any) {
    // 处理不同登录方式的错误
    if (loginMethod.value === 'password' && error.response?.status === 401) {
      errorMessage.value = '邮箱或密码错误，请重试';
    } else {
      errorMessage.value = error.response?.data?.message || '登录失败，请重试';
    }
  } finally {
    isLoading.value = false;
  }
};

// 新增：微信登录逻辑
// const handleWechatLogin = async () => {
//   try {
//     isLoading.value = true;
    
//     // 1. 先获取微信登录所需的参数（如redirect_uri等）
//     const { data } = await apiHandleWechatCallback({
// 		code:'0919Ua0w3RkRi53zjL0w3w3bT439Ua0k',
// 		state: 'asrdaskljrlk12312'
// 	});
	
// 	console.log(data);
	
    
//     // 2. 跳转微信登录页面
//     window.location.href = data.authorization_url;
//   } catch (error: any) {
//     errorMessage.value = error.response?.data?.message || '微信登录失败，请重试';
//     isLoading.value = false;
//   }
// };
// // 微信回调 用于存储微信登录的信息
// const handleWechatCallback = () => {
// 	const params = new URLSearchParams(window.location.search)
// 	const code = params.get('code')
// 	const state = params.get('state')
	
// 	if (code && state) {
// 		// 有微信回调参数，调用后端接口换取token 
// 		apiExchangeWechatCode({ code, state })
// 		.then((response) => {
// 			// 保存 token 并跳转
// 			authStore.setToken(response.data.token)
// 			router.push('/')
// 		})
// 		.catch((error) => {
// 			errorMessage.value = '微信登录失败'
// 		})
// 	}
// }

// 组件卸载时清理计时器（保持不变）
onUnmounted(() => {
	// handleWechatCallback()
  if (timer) {
    clearInterval(timer as number);
  }
});
</script>

<style lang="scss" scoped>
/* 原有样式保持不变 */
.fullscreen-login {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.login-brand {
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-content {
  max-width: 600px;
  z-index: 2;
}

.brand-logo {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.brand-slogan {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.5;
}

.brand-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f8fafc;
  width: 100%;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

/* 新增：登录方式切换标签 */
.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #3b82f6;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.2s ease-out;
  overflow: hidden;
}

// 给切换的内容区域添加过渡
.form-group.code-group, // 验证码区域
.form-group:has(.icon-password), // 密码输入框区域
.password-options { // 密码选项区域
  transition: all 0.2s ease-out;
  max-height: 200px; // 足够容纳内容的最大高度
  opacity: 1;
}

// 隐藏时的状态（配合v-show）
.form-group.code-group[style*="display: none"],
.form-group:has(.icon-password)[style*="display: none"],
.password-options[style*="display: none"] {
  max-height: 0;
  opacity: 0;
  margin: 0; // 隐藏时移除margin，避免占位异常
  padding: 0;
  overflow: hidden;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.input-group {
  position: relative;
}

.icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 18px;
}

/* 新增：密码相关样式 */
.icon-password {
  left: 18px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.password-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -16px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  color: #64748b;
  cursor: pointer;
}

.remember-me input {
  margin-right: 6px;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #2563eb;
  text-decoration: underline;
}

.form-input {
  width: 100%;
  height: 52px;
  padding: 0 16px 0 48px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  color: #1e293b;
  transition: all 0.2s ease;
  background-color: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* 找到 .code-group 的样式 */
.code-group {
  display: flex;
  gap: 12px; /* 保持间距 */
}

/* 修改验证码输入框宽度 */
.code-input {
  flex: 1; /* 只保留 flex:1，去掉 width:90% 的限制 */
  min-width: 0; /* 允许输入框在小屏幕下收缩 */
}

.send-btn {
  min-width: 120px;
  width: 120px;
  height: 52px;
  padding: 0 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.send-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: -16px;
  height: 16px;
}

.login-btn {
  width: 100%;
  height: 56px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  box-sizing: border-box;
}

.login-btn:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
}

.login-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  text-align: center;
  animation: spin 1s infinite;
}

@keyframes spin {
  0% { transform: translateX(-10px); opacity: 0.3; }
  50% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(10px); opacity: 0.3; }
}

/* 新增：其他登录方式样式 */
.other-login-methods {
  margin-top: 20px;
}

.separator {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.separator .line {
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
}

.separator .text {
  padding: 0 10px;
  font-size: 14px;
  color: #94a3b8;
}

.wechat-login-btn {
  width: 100%;
  height: 52px;
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.wechat-login-btn:hover:not(:disabled) {
  background-color: #06b355;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(7, 193, 96, 0.2);
}

.wechat-login-btn:disabled {
  background-color: #8ce9b5;
  cursor: not-allowed;
}

.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
}

.link {
  color: #3b82f6;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 图片验证码弹窗样式保持不变 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}


.modal-container {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 20px;
}

.captcha-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.captcha-image {
  width: 200px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #e2e8f0;
}

.captcha-input-group {
  margin-top: 10px;
  width: 82%;
}

.captcha-input {
  padding-left: 48px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #f1f5f9;
  color: #334155;
  border: none;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
}

.confirm-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.confirm-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: -4px;
}

/* 移动端适配 */
@media (max-width: 992px) {
  .fullscreen-login {
    flex-direction: column;
  }

  .login-brand {
    flex: none;
    width: 100%;
    padding: 30px 20px;
    text-align: center;
  }

  .brand-logo {
    font-size: 36px;
    margin-bottom: 16px;
  }

  .brand-slogan {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .brand-image {
    display: none;
  }

  .login-form-container {
    flex: none;
    width: 100%;
    padding: 30px 20px;
  }

  .modal-container {
    margin: 0 20px;
  }

  .captcha-image {
    width: 160px;
  }
}

@media (max-width: 576px) {
  .code-group {
    flex-direction: column; /* 移动端垂直排列 */
  }
  
  .code-input, .send-btn {
    width: 100% !important; /* 移动端都占满宽度 */
  }
  
  .send-btn {
    height: 52px; /* 保持与输入框一致的高度 */
  }
}
</style>