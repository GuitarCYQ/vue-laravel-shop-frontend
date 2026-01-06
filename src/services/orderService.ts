// 引入拦截器
import api from '../api/axios';

// 订单列表
export const apiGetOrders = () => {
	return api.get('/v1/orders');
}

// 订单详情
export const apiGetOrderDetail = (id: number) => {
	return api.get(`/v1/orders/${id}`);
}

// 创建订单
export const apiCreateOrders = (data: Object) => {
	return api.post('/v1/orders', data);
}

// 取消订单
export const apiCancelOrder = (id: number) => {
	return api.post(`/v1/orders/${id}/cancel`);
}

// 确认收货
export const apiReceivedOrders = (order: number) => {
	return api.post(`/v1/orders/${order}/received`);
}

// 评论
export const apiOrdersSendReview = (order: number, data: Object) => {
	return api.post(`/v1/orders/${order}/sendReview`, data);
}