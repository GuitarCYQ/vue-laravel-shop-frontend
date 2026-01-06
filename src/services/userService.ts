// 引入拦截器
import api from '../api/axios';

// 上传图片
export const apiUpdateAvatar = (data:FormData) => {
	return api.post('/v1/images', data, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
}

// 编辑资料
export const apiUpdateUserInfo = (data:{name:string; avatar_image_id:number}) => {
	return api.patch('/v1/user', data);
}