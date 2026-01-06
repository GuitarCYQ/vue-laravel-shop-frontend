// 引入拦截器
import api from '../api/axios';


// 获取地址列表
export const apiGetAddresses = () => {
	return api.get('/v1/addresses');
}

// 添加地址
export const apiCreateAddresses = (data: Object) => {
	return api.post('/v1/addresses', data);
}

// 设置为默认地址
export const apiIsDefaultAddress = (addressId: number) => {
	return api.patch(`/v1/addresses/${addressId}/default`);
}

// 修改地址
export const apiUpdateAddresses = (addressId: number, data: Object) => {
	return api.put(`/v1/addresses/${addressId}`, data);
}

// 删除地址
export const apiDeleteAddress = (addressId: number) => {
	return api.delete(`/v1/addresses/${addressId}`);
}