import {defineStore} from 'pinia';
import { apiGetProducts } from '@/services/productService'
import { ElMessage } from 'element-plus'

export const useSearchStore = defineStore('search', {
	state: () => ({
		searchQuery: '', // 全局搜索关键词
		products: [], // 商品列表结果
		pagination: {
			current_page: 1,
			last_page: 1,
			per_page: 12,
			total: 0
		},
		loading: false, // 加载状态
		// 筛选条件
		filter: {
			categoryId: null as number | null,
			subcategoryId: null as number | null,
			sortType: 'default',
			priceMin: null as number | null,
			priceMax: null as number | null,
			type: '' // hot热门 new新品 discount折扣
		},
	}),
	actions: {
		// 设置搜索关键词
		setSearchQuery(query: string) {
			this.searchQuery = query;
		},
		setSearchType(type: string) {
			this.type = type;
			this.resetPage();
		},
		// 清空搜索词
		cleanSearch() {
			this.searchQuery= ''
			// this.products = [];
			this.pagination.current_page = 1
		},
		updateFilter(filter: Partial<typeof this.filter>) {
			this.filter = {...this.filter, ...filter}
			this.resetPage()
		},
		// 重置分页（切换条件时调用）
		resetPage() {
			this.pagination.current_page = 1
		},
		
	
		
		// 执行搜索
		async fetchProducts() {
			console.log(this.searchQuery,'asdasdas')
			this.loading = true
			try {
				const { data } = await apiGetProducts({
				  page: this.pagination.current_page,
				  per_page: this.pagination.per_page,
				  sort: this.filter.sortType,
				  category_id: this.filter.categoryId,
				  subcategory_id: this.filter.subcategoryId,
				  min_price: this.filter.priceMin,
				  max_price: this.filter.priceMax,
				  search: this.searchQuery,
				  type: this.filter.type,
				});
				this.products = data.data
				this.pagination = {
					...this.pagination,
					current_page:data.meta.current_page,
					last_page: data.meta.last_page,
					total: data.meta.total,
					per_page: data.meta.per_page
				}
			} catch (err) {
				ElMessage.error('获取商品失败，请您重试') 
				console.log(err);
			} finally {
				this.loading = false
			}
		},
		
		// 分页相关方法
		setPage(page: number) {
			if (page >= 1 && page <= this.pagination.last_page) {
				this.pagination.current_page = page
				this.fetchProducts(); // 切换页面后重新请求
			}
		},
		
		prevPage() {
			if (this.pagination.current_page > 1) {
				this.setPage(this.pagination.current_page - 1)
			}
		},
		nextPage() {
			if (this.pagination.current_page < this.pagination.last_page) {
				this.setPage(this.pagination.current_page + 1)
			}
		}
	}
})