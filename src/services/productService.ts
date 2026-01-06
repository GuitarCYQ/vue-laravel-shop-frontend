// 引入拦截器
import api from '../api/axios';


// 获取产品列表
export const apiGetProducts = (params: Object) => {
	return api.get('/v1/products', {params});
}

export const apiGetProductDetail = (id: number) => {
	return api.get(`/v1/products/${id}`,);
}
