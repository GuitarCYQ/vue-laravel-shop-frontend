// 引入拦截器
import api from '../api/axios';


// 获取图片验证码
export const apiGetCaptcha = (data: { email: string}) => {
	return api.post('/v1/captchas', data);
}

// 获取验证码
export const apiGetCode = (data: { captcha_key: string; captcha_code: string; email: string}) => {
	return api.post('/v1/verification-codes', data);
}


// 邮箱验证码登录
export const apiLoginWithEmail = (data: { email: string; code: string; key: string }) => {
	return api.post('/v1/login/email', data);
}

// 密码登录
export const apiLoginWithPassword = (data: { username: string; password: string }) => {
	return api.post('/v1/login/password', data);
}

// // 第三方登录-微信登录URL
// export const apiGetWechatAuthorizationUrl = (data:{code:string; state:string}) => {
// 	return api.post('/v1/socials/wechat/authorizations', data);
// }

// // 第三方登录-微信登录
// export const apiHandleWechatCallback  = (data: { code: string, state:string } ) => {
// 	return api.post('/v1/socials/wechat/authorizations', data);
// }

// 退出登录
export const apiLogout = (data=null) => {
	return api.delete('/v1/logout');
}