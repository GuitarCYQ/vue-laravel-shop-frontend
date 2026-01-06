// 引入拦截器
import api from '../api/axios';


// 调用后端创建支付宝支付表单
export const apiRequestAlipay = (orderId: number) => {
	return api.post(`/v1/alipay/create/${orderId}`);
}

// 查询订单支付状态
export const apiCheckPayStatus = (orderId: number) => {
	return api.get('/v1/alipay/query', {params: { orderId }});
}

// 支付同步回调验签
export const apiVerifyAlipayReturn = (params: Record<string, any>) => {
	return api.get('/v1/payment/alipay/return', { params });
}



// 关闭超时订单
export const apiCloseOrder = (orderId: number) => {
	return api.post(`/v1/orders/${orderId}/close`);
}




// 获取支付宝支付链接
export const apigetAlipayPayUrl = (orderId: number) => {
	return api.get(`/v1/payment/${orderId}/alipay`);
}

// 验证支付宝支付状态
export const apiVerifyAlipayStatus = (params: { out_trade_no: string}) => {
	return api.post('/v1/payment/alipay/verify', params);
}
