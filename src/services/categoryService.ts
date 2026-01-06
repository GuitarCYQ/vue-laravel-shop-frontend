// 引入拦截器
import api from '../api/axios';


// 获取分类列表
export const apiGetCategories = (params: Object) => {
	return api.get('/v1/productcategories', {params});
}

