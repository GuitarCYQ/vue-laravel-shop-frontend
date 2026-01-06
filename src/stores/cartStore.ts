import { defineStore } from 'pinia'
import { apiGetCartList } from '@/services/cartService'


export const useCartStore = defineStore('cart', {
	state: () => ({
		totalCount: 0,
	}),
	
	actions: {
		// 计算购物车总数量 (所有页面共享)
		getTotalCount(cartItem: any[]) {
			this.totalCount = new Set(cartItem.map(item => item.product_sku.id)).size
		},
		
		// 从接口获取数量
		async syncCategoryCount() {
			try {
				const { data } = await apiGetCartList();
				this.getTotalCount(data);
			} catch (err) {
				console.log('同步购物车数量失败', err)
			}
		}
	}
})