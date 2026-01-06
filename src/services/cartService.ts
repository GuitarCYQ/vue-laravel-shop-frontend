// 引入拦截器
import api from '../api/axios';

// 加入购物车
export const apiAddCart = (data: Object) => {
	return api.post('/v1/carts', data);
}

// 查询购物车列表
export const apiGetCartList = () => {
	return api.get(`/v1/carts`);
} 

// 删除购物车物品
export const apiDeleteCartProduct = (data: Object) => {
	return api.delete(`/v1/carts`, {data});
}
