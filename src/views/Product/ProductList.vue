<!-- 商品分类页 -->
<template>
  <div class="category-page">
    <!-- 导航栏（复用主页导航） -->
	<Header
		v-model:show-search="showSearch"
		v-model:show-mobile-menu="showMobileMenu"
	>
		<!-- <template #icon>
			<div class="nav-actions">
			  <button class="action-btn search-btn" @click="clickSearch">
			    <i class="icon-search"></i>
			  </button>
			  <button class="action-btn cart-btn" @click="$router.push('/cart')">
			    <i class="icon-cart"></i>
			    <span class="cart-count">3</span>
			  </button>
			  <button class="action-btn user-btn" @click="$router.push('/user')">
			    <i class="icon-user"></i>
			  </button>
			</div>
		</template> -->
		
		<template #mobile-nav>
			<ul class="mobile-nav-list">
			  <li class="mobile-nav-item"><a href="#" class="active">首页</a></li>
			  <li class="mobile-nav-item"><a href="#">分类</a></li>
			  <li class="mobile-nav-item"><a href="#">新品</a></li>
			  <li class="mobile-nav-item"><a href="#">热卖</a></li>
			  <li class="mobile-nav-item"><a href="#">优惠</a></li>
			</ul>
		</template>
	</Header>
	
	

    <main class="container">
      <div class="category-content">
        <!-- 左侧分类导航 -->
        <aside class="category-sidebar">
          <!-- <h3 class="sidebar-title">全部分类</h3> -->
          <ul class="category-tree">
			<li
			 class="category-item"
			 :class="{active : searchStore.filter.categoryId === null }"
			 @click="handleCategorySelect(null, null)"
			>
				<a href="javascript:;">
					<span class="category-name">全部分类</span>
					<i class="icon-arrow-right"></i>
				</a>
			</li>
            <li 
              class="category-item" 
              v-for="(category) in categories" 
              :key="category.id"
              :class="{ active: searchStore.filter.categoryId === category.id  }"
              @click="handleCategorySelect(category.id, null)"
            >
              <a href="javascript:;">
                <span class="category-name">{{ category.name }}</span>
                <i class="icon-arrow-right"></i>
              </a>
              <!-- 二级分类 -->
              <ul class="subcategory-list" v-if="category.children && searchStore.filter.categoryId === category.id">
                <li 
                  class="subcategory-item" 
                  v-for="(sub) in category.children" 
                  :key="sub.id"
                  :class="{ active: searchStore.filter.subcategoryId === sub.id }"
                  @click.stop="handleCategorySelect(category.id, sub.id)"
                >
                  {{ sub.name }}
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <!-- 右侧商品列表 -->
        <div class="category-products">
          <!-- 筛选栏 -->
          <div class="filter-bar">
            <div class="filter-sort">
              <span class="filter-label">排序方式：</span>
              <button 
                class="sort-btn" 
                :class="{ active: searchStore.filter.sortType === 'default' }"
                @click="searchStore.updateFilter({ sortType: 'default'}); searchStore.resetPage(); searchStore.fetchProducts()"
              >
                默认排序
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: searchStore.filter.sortType === 'price_asc' }"
                @click="searchStore.updateFilter({ sortType: 'price_asc'}); searchStore.resetPage(); searchStore.fetchProducts()"
              >
                价格从低到高
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: searchStore.filter.sortType === 'price_dasc' }"
				@click="searchStore.updateFilter({ sortType: 'price_dasc'}); searchStore.resetPage(); searchStore.fetchProducts()"
              >
                价格从高到低
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: searchStore.filter.sortType === 'sold_count_desc' }"
				@click="searchStore.updateFilter({ sortType: 'sold_count_desc'}); searchStore.resetPage(); searchStore.fetchProducts()"
              >
                销量优先
              </button>
            </div>

            <div class="filter-price">
              <span class="filter-label">价格区间：</span>
              <div class="price-range">
                <input 
                  type="number" 
                  v-model.number="searchStore.filter.priceMin" 
                  placeholder="最低" 
                  class="price-input"
                >
                <span class="price-separator">-</span>
                <input 
                  type="number" 
                  v-model.number="searchStore.filter.priceMax" 
                  placeholder="最高" 
                  class="price-input"
                >
                <button class="btn-filter" @click="searchStore.resetPage(); searchStore.fetchProducts()">筛选</button>
              </div>
            </div>
          </div>
		  
		  <!-- 加载状态 -->
			<div v-if="searchStore.loading" class="loading">
			  加载中...
			</div>

          <!-- 商品列表 -->
          <div class="product-grid" v-else>
            <div 
              class="product-card" 
              v-for="(product) in searchStore.products" 
              :key="product.id"
              @click="goDetail(product.id)"
            >
              <div class="product-img">
                <img :src="product.image" :alt="product.title">
				<!-- 加入购物车 -->
                <button class="product-add" @click.stop="addToCart(product, $event)">
                  <i class="icon-cart"></i>
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.title }}</h3>
                <div class="product-price">
                  <span class="price-current">¥{{ product.final_price }}</span>
                  <span class="price-original" v-if="product.discount && product.discount > 0">¥{{ product.price }}</span>
                </div>
                <div class="product-rating">
                  <i class="icon-star" v-for="n in 5" :key="n" :class="{ active: n <= product.rating }"></i>
                  <span class="rating-count">({{ product.review_count }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-if="!searchStore.loading && searchStore.products.length === 0">
            <img src="https://picsum.photos/id/20/100/100" alt="暂无商品">
            <p>该分类下暂无商品</p>
          </div>

          <!-- 分页 -->
          <div class="pagination" v-if="!searchStore.loading && searchStore.pagination.total > 0 &&  searchStore.pagination.total > searchStore.pagination.per_page">
            <button class="page-btn prev" @click="searchStore.prevPage" :disabled="searchStore.pagination.current_page === 1">上一页</button>
			<button
			  class="page-num" 
			  v-for="page in searchStore.pagination.last_page" 
			  :key="page"
			  :class="{ active: searchStore.pagination.current_page === page }"
			  @click="searchStore.setPage(page)"
			>
			  {{ page }}
			</button>
            <button 
			class="page-btn next" 
			@click="searchStore.nextPage()" 
			:disabled="searchStore.pagination.current_page === searchStore.pagination.last_page">
			下一页
			</button>
          </div>
		  
        </div>
      </div>
    </main>
	
	<!-- 加入购物车动画 -->
	<div class="cart-animation-container"></div>
	
	<!-- 页脚 -->
	<Footer/>
	
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import Header from '@/components/Layouts/_header.vue'
import Footer from '@/components/Layouts/_footer.vue' 
import {ElMessage, ElLoading} from 'element-plus'
import {apiGetCategories} from '@/services/categoryService'
import {apiGetProducts} from '@/services/productService'
import {apiAddCart} from '@/services/cartService'
import { useSearchStore } from '@/stores/searchStore';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute()
const searchStore = useSearchStore(); // 实例化搜索全局状态

// 组件传递状态管理
const showSearch = ref(false)
const showMobileMenu = ref(false)




// 分类数据
const categories = ref([])
// 获取分类数据
const getProductCategoies = async () => {
	try {
		const {data} = await apiGetCategories({});
		categories.value = data
		// console.log(data);
	} catch(err) {
		ElMessage.error('分类数据失败，请您重试') 
		console.error(err);
	}
}

// 分类选择
const handleCategorySelect = (categoryId: number | null, subcategoryId: number | null) => {
	searchStore.updateFilter({categoryId, subcategoryId})
	searchStore.resetPage() // 切换分类重置页码
	searchStore.fetchProducts() // 重新发起请求
}

// 页码初始化时加载分类和商品
onMounted(async () => {
	const keyword = (route.query.k as string) || ''
	const type = (route.query.t as string) || ''
	const categoryId = Number(route.params.c) || ''
	// const currentQuery = { ...router.currentRoute.value.query }
	// if ('t' in currentQuery) {
	// 	delete currentQuery.t
	// 	router.replace({
	// 		...router.currentRoute.value,
	// 		query: currentQuery
	// 	})
	// } 
	searchStore.resetPage() // 切换分类重置页码
	if(keyword) {
		searchStore.setSearchQuery(keyword)
	} 
	if(categoryId) {
		searchStore.updateFilter({ categoryId })
	}
	if(type) {
		searchStore.updateFilter({ type })
	}
	try {
		await getProductCategoies()
		// 确保没有重复请求
		if (!searchStore.loading) {
			searchStore.fetchProducts()
		}
	} catch (error) {
		console.log('初始化数据失败：', error);
		searchStore.fetchProducts();
	}

})


// 监听搜索词变化（Store中搜索词变化时，自动发起请求）
watch( 
	() => [searchStore.searchQuery, route.query.t],
	() => {
		searchStore.resetPage() // 重置页码
		searchStore.fetchProducts() // 发起请求
	},
	{ deep:true }
)


// 加入购物车
const addToCart = (product: any, event:MouseEvent) => {
  // 1. 按钮点击反馈动画
  const button = event?.currentTarget as HTMLButtonElement
  button.classList.add('clicked'); //触发按钮缩放动画
  setTimeout(() => button.classList.remove('clicked'), 300) // 300秒后移除动画
  
  // 2. 创建商品图片克隆，用于飞入购物车动画
  const imgClone = document.createElement('img');
  imgClone.src = product.image
  imgClone.classList.add('cart-fly'); // 应用飞入动画类
  document.querySelector('.cart-animation-container')?.appendChild(imgClone);
  
  // 获取按钮和购物车图标的位置
  const buttonRect = button.getBoundingClientRect();
  const cartIcon = document.querySelector('.cart-btn') as HTMLButtonElement;
  const cartRect = cartIcon.getBoundingClientRect();

  
  // 设置克隆图片的初始位置(按钮位置)
  imgClone.style.left = `${buttonRect.left}px`
  imgClone.style.top = `${buttonRect.top}px`
  
  // 3.触发飞入动画(抛物线运动到购物车)
  setTimeout(() => {
	  // 目标位置（购物车图标位置）
	  imgClone.style.left = `${cartRect.left + cartRect.width/2 - 16}px`
	  imgClone.style.top = `${cartRect.top + cartRect.height/2 - 16}px`
	  imgClone.style.opacity = '0'
	  imgClone.style.transform = 'scale(0.2)'
  }, 10) //延迟10ms确保样式应用
  
  // 4.动画结束后移除克隆元素
  setTimeout(() => {
	  imgClone.remove()
	  updateCartCount() // 更新购物车数量
  }, 800)
  
  console.log(product);
  
  ElMessage.success(`${product.title} 已加入购物车`);
};

// 更新购物车数量并添加动画
const updateCartCount = async() => {
	try {
		const {data} = await apiAddCart({
			sku_id: selectedSkuId.value,
			amount: quantity.value
		});
		categories.value = data
		// console.log(data);
	} catch(err) {
		ElMessage.error('分类数据失败，请您重试') 
		console.error(err);
	}
	
	const countEl = document.querySelector('.cart-count') as HTMLSpanElement
	if (countEl) {
		// 数字变化动画
		countEl.classList.add('count-change')
		const current = parseInt(countEl.textContent || '0')
		countEl.textContent = (current + 1).toString()
		setTimeout(() => countEl.classList.remove('count-change'), 500)
	}
}

// 前往详情页
const goDetail = (id:number) => {
	router.push({
		name: 'Detail',
		params: {id}
	})
}

</script>

<style lang="scss" scoped>
@import '../../assets/css/common/common.scss';
	
	
// 基础样式变量（复用主页）
$primary: #ff4400;
$primary-light: #ff6733;
$gray-light: #f5f5f5;
$gray: #999;
$gray-dark: #333;
$white: #fff;

.category-page {
  background-color: #fafafa;
  min-height: 100vh;
}

main {
  padding: 20px 0;
}

.category-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 左侧分类导航
.category-sidebar {
  background-color: $white;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none; // 移动端隐藏侧边栏，可通过弹窗实现
  }

  .sidebar-title {
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 600;
    background-color: $gray-light;
    color: $gray-dark;
  }

  .category-tree {
    list-style: none;
    margin: 0;
    padding: 0;

    .category-item {
      border-bottom: 1px solid $gray-light;

      &:last-child {
        border-bottom: none;
      }

      &.active {
        background-color: rgba(255, 68, 0, 0.05);

        .category-name {
          color: $primary;
        }
      }

      a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        color: $gray-dark;
        text-decoration: none;

        .category-name {
          font-size: 14px;
        }

        .icon-arrow-right {
          font-size: 12px;
          color: $gray;
        }
      }

      .subcategory-list {
        list-style: none;
        margin: 0;
        padding: 0 0 0 30px;
        background-color: $white;

        .subcategory-item {
          padding: 10px 0;
          font-size: 13px;
          color: $gray-dark;
          cursor: pointer;

          &:hover {
            color: $primary;
          }

          &.active {
            color: $primary;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 右侧商品列表
.category-products {
  .filter-bar {
    background-color: $white;
    border-radius: 8px;
    padding: 12px 20px;
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;

    .filter-label {
      font-size: 14px;
      color: $gray;
    }

    .filter-sort, .filter-price {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sort-btn {
      padding: 6px 12px;
      background: none;
      border: 1px solid $gray-light;
      border-radius: 4px;
      font-size: 14px;
      color: $gray-dark;
      cursor: pointer;

      &.active {
        background-color: $primary;
        color: white;
        border-color: $primary;
      }

      &:hover:not(.active) {
        border-color: $primary;
        color: $primary;
      }
    }

    .price-range {
      display: flex;
      align-items: center;
      gap: 8px;

      .price-input {
        width: 80px;
        padding: 6px 10px;
        border: 1px solid $gray-light;
        border-radius: 4px;
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: $primary;
        }
      }

      .price-separator {
        color: $gray;
      }

      .btn-filter {
        padding: 6px 12px;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background-color: $primary-light;
        }
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  .product-card {
    background-color: $white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .product-img {
      position: relative;
      padding-top: 100%;
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .product-add {
        position: absolute;
        bottom: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: $primary;
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 10;
		transition: all 0.3s;

        &:hover {
          background-color: $primary-light;
        }
		&.clicked {
			transform: scale(1.2);
			opacity: 0.8;
		}
      }
	  
	  
	  

      &:hover .product-add {
        opacity: 1;
      }
    }

    .product-info {
      padding: 12px;

      .product-name {
        font-size: 14px;
        color: $gray-dark;
        margin: 0 0 8px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 36px;
      }

      .product-price {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .price-current {
          color: $primary;
          font-size: 16px;
          font-weight: 600;
        }

        .price-original {
          color: $gray;
          font-size: 12px;
          text-decoration: line-through;
          margin-left: 8px;
        }
      }

      .product-rating {
        display: flex;
        align-items: center;
        font-size: 12px;

        .icon-star {
          color: #ddd;
          margin-right: 2px;

          &.active {
            color: #ffcc00;
          }
        }

        .rating-count {
          color: $gray;
          margin-left: 4px;
        }
      }
    }
  }

  // 空状态
  .empty-state {
    text-align: center;
    padding: 60px 0;
    background-color: $white;
    border-radius: 8px;

    img {
      width: 100px;
      height: 100px;
      opacity: 0.5;
      margin-bottom: 16px;
    }

    p {
      color: $gray;
      font-size: 16px;
    }
  }

  // 分页
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 30px;
    padding: 16px;

    .page-btn, .page-num {
      padding: 6px 12px;
      border: 1px solid $gray-light;
      border-radius: 4px;
      background-color: $white;
      color: $gray-dark;
      cursor: pointer;
      font-size: 14px;

      &:hover:not(.active):not(:disabled) {
        border-color: $primary;
        color: $primary;
      }

      &.active {
        background-color: $primary;
        color: white;
        border-color: $primary;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}


.cart-animation-container {
  position: fixed;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // 不用填写其他元素的点击
  z-index: 9999;
}

::v-deep .cart-fly {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  z-index: 100000;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); //抛物线缓动函数
  transform: scale(1);
  opacity: 1;
}

.product-card .product-img .product-add{
	transition:all 0.3s;
	
	&.clicked {
		transform: scale(1.2);
		opacity: 0.8;
	}
}

::v-deep .cart-count{
	position: relative;
	display: inline-block;

	&.count-change {
		animation: countPulse 0.5s ease;
	}
}

@keyframes countPulse {
  0%{ transform: scale(1);}
  50%{ transform: scale(1.5); color: #fff}
  100%{ transform: scale(1);}
}
</style>