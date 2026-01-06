<!-- 详情页 -->
<template>
  <div class="product-detail">
	
	<!-- 导航栏 -->
	<Header
		v-model:show-search="showSearch"
		v-model:show-mobile-menu="showMobileMenu"
	>
		<template #nav>
			<nav class="main-nav hidden md:flex">
			  <ul class="nav-list">
			    <li class="nav-item"><router-link to="/" >首页</router-link></li>
			    <li class="nav-item"><router-link to="/category" >分类</router-link></li>
			    <li class="nav-item"><router-link to="/new" >新品</router-link></li>
			    <li class="nav-item"><router-link to="/" >热门</router-link></li>
			    <li class="nav-item"><router-link to="/">优惠</router-link></li>
			  </ul>
			</nav>
		</template>
		
		<template #icon>
			<div class="nav-actions">
			  <button class="action-btn search-btn" @click="clickSearch()">
			    <i class="icon-search"></i>
			  </button>
			  <button class="action-btn cart-btn" @click="$router.push('/cart')">
			    <i class="icon-cart"></i>
			    <span class="cart-count">{{ cartCount }}</span>
			  </button>
			  <button class="action-btn user-btn" @click="$router.push('/user')">
			    <i class="icon-user"></i>
			  </button>
			  <button class="action-btn menu-btn md:hidden" @click="showMobileMenu = true">
			    <i class="icon-menu"></i>
			  </button>
			</div>
		</template>
		
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
      <div class="product-content">
        <!-- 商品图片区 -->
        <div class="product-gallery">
          <div class="main-img">
            <img 
			v-if="mainImage"
			:src="mainImage"
			:alt="product.title">
          </div>
          <div class="thumb-img-list">
            <div class="thumb-img" v-for="(img, idx) in product.images" :key="idx">
              <img 
			  :src="img" 
			  :alt="img" 
			  @click="mainImage = img"
			  :class="{ 'active' : mainImage === img}">
            </div>
          </div>
        </div>

        <!-- 商品信息区 -->
        <div class="product-info">
          <h1 class="product-name">{{ product.title }}</h1>
          <div class="product-tags">
            <span class="tag hot" v-if="product.isHot">热门</span>
            <span class="tag new" v-if="product.isNew">新品</span>
            <span class="tag sale" v-if="product.discount < 1 && product.discount > 0">限时折扣</span>
          </div>
          <div class="product-price">
            <span class="price-current">¥{{ skuPrice }}</span>
<!--            <span class="price-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span> -->
            <span class="discount" v-if="product.discount">{{ product.discount }}折</span>
          </div>
          <div class="product-stock">
            <span class="label">库存：</span>
            <span class="value">{{ maxStock }}件</span>
          </div>
          <div class="product-desc">
            <span class="label">简介：</span>
            <span class="value">{{ product.description }}</span>
          </div>

          <!-- 规格选择 -->
         <div class="product-sku" v-if="product.skus && product.skus.length > 0">
            <span class="label">规格：</span>
            <div class="sku-options">
              <button 
                class="sku-option" 
                v-for="(sku) in product.skus" 
                :key="sku.id"
                :class="{ active: selectedSkuId === sku.id }"
                @click="selectedSku(sku)"
              >
                {{ sku.title }}
              </button>
            </div>
          </div>

          <!-- 数量选择 -->
          <div class="product-quantity">
            <span class="label">数量：</span>
            <div class="quantity-control">
              <button class="btn minus" @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
              <input type="number" v-model="quantity" min="1" :max="maxStock">
              <button class="btn plus" @click="increaseQuantity" :disabled="quantity >= maxStock">+</button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="product-actions">
            <button class="btn add-to-cart" @click="addToCart">加入购物车</button>
            <button class="btn buy-now" @click="buyNow">立即购买</button>
          </div>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="product-detail-tabs">
        <div class="tabs-nav">
          <button class="tab-btn active">商品详情</button>
          <button class="tab-btn">规格参数</button>
          <button class="tab-btn">用户评价</button>
        </div>
        <div class="tabs-content">
          <div class="detail-content">
            <img :src="product.detailImg" alt="商品详情" class="detail-img">
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <Footer/>


	
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/components/Layouts/_header.vue'
import Footer from '@/components/Layouts/_footer.vue' 
import { apiGetProductDetail } from '@/services/productService'
import { apiAddCart } from '@/services/cartService'
import { ElMessage  } from 'element-plus'
import { useSearchStore } from '@/stores/searchStore';
import router from '@/router';


// 路由参数
const route = useRoute();
const searchStore = useSearchStore()

// 搜索状态管理
const showSearch = ref(false)
const showMobileMenu = ref(false)
const clickSearch = () => {
	showSearch.value = !showSearch.value
	if (showSearch.value) {
		searchStore.setSearchQuery('') // 打开搜索框时清空历史搜索词
	}
}
watch(
	() => searchStore.searchQuery,
	(newQuery) => {
		if(showSearch.value && newQuery.trim()) {
			setTimeout(() => {
				router.push({
					name: 'List',
					query: {
						k: newQuery.trim()
					}
				})
				showSearch.value = false
			},500)
		}
	}
)


// SKU价格
const skuPrice = ref('')
// 被选中的SKU的id
const selectedSkuId = ref('')
// 选择SKU
const selectedSku = (sku: any) => {
	skuPrice.value = sku.price
	selectedSkuId.value = sku.id
	maxStock.value = sku.stock
}

// 主图地址
const mainImage = ref('');
// 商品数据（实际项目中从接口获取）
const productId = route.params.id;
const product = ref({})
const getProductDetail = async () => {
	try {
		const {data} = await apiGetProductDetail(productId);
		product.value = data
		
		if (product.value.skus && product.value.skus.length >0) {
			selectedSku(product.value.skus[0])
			let minSku = product.value.skus[0]
			product.value.skus.forEach(sku => {
				if(sku.price < minSku.price) {
					minSku = sku
				}
			})
			skuPrice.value = minSku.price
			selectedSkuId.value = minSku.id
			maxStock.value = minSku.stock
		}
		 // 初始化主图为第一张
		if (product.value.images && product.value.images.length > 0) {
			mainImage.value = product.value.images[0];
		}
		console.log(product.value);
	} catch(err: any) {
		console.error(err);
	}
}
getProductDetail()
setTimeout(() => {
	product.value.images.forEach(img => {
		mainImage.value = img
	})
},3000)

// 购物车数量
const cartCount = ref(3);
// 数量
const quantity = ref(1);
// SKU最大的数量
const maxStock = ref<number>(1)


// 减少商品数量
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};
// 增加商品数量
const increaseQuantity = () => {
  if (quantity.value < maxStock.value) quantity.value++;
};

// 加入购物车
const addToCart = async () => {
	if (selectedSkuId.value === '') {
		ElMessage({
			message:'请选择商品规格',
			type: 'error',
			plain: true
		})
	  return;
	}
	try {
		const {data} = await apiAddCart({
			sku_id: selectedSkuId.value,
			amount: quantity.value
		})
		console.log(data.errors);

		cartCount.value++;
		ElMessage({
			message:'已加入购物车,正在跳转到购物车...',
			type: 'success',
			plain: true
		})
		
		setTimeout(() => {
			router.push({
				name:'Cart'
			})
		},1000)
		
	} catch (err:any) {
		let errorMsg =  '加入购物车失败，请稍后再试';
		// 处理错误
		if (err.response && err.response.status === 422) {
			// 从响应中提取错误谢谢
			const errors = err.response.data.errors
			if (errors) {
				// 取第一个错误信息显示（如 sku_id 或 amount 的错误）
				errorMsg = Object.values(errors)[0][0];
			} else {
				// 后端返回的 message 字段（如“验证失败”）
				errorMsg = err.response.data.message || errorMsg
			}
		}
		
		// 显示错误提示
		ElMessage({
		  message: errorMsg,
		  type: 'error',
		  plain: true
		});
	}
};

// 立即购买
const buyNow = () => {
  if (!selectedSku.value && product.value.skus.length) {
    toastMessage.value = '请选择商品规格';
    showToast.value = true;
    setTimeout(() => showToast.value = false, 2000);
    return;
  }
  // 跳转到结算页（传递商品信息）
  localStorage.setItem('checkoutProduct', JSON.stringify({
    ...product.value,
    selectedSku: selectedSku.value || '默认',
    quantity: quantity.value
  }));
  window.location.href = '/checkout';
};

</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss';	

main {
  padding: 20px 0;
}

// 商品内容区
.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 50px;
  padding: 20px;
  background-color: $white;
  border-radius: 8px;
  margin-top: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 商品图片区
.product-gallery {
  .main-img {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }

  .thumb-img-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 10px;

    .thumb-img {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;

      &:hover, &.active {
        border-color: $primary;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

// 商品信息区
.product-info {
  .product-name {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .product-tags {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;

    .tag {
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 4px;
      color: white;

      &.hot { background-color: $red; }
      &.new { background-color: #00b42a; }
      &.sale { background-color: $primary; }
    }
  }

  .product-price {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $gray-light;

    .price-current {
      font-size: 24px;
      color: $red;
      font-weight: 600;
      margin-right: 10px;
    }

    .price-original {
      font-size: 14px;
      color: $gray;
      text-decoration: line-through;
      margin-right: 10px;
    }

    .discount {
      font-size: 14px;
      color: $primary;
      background-color: rgba(255, 68, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .product-stock, .product-desc, .product-sku, .product-quantity {
    margin-bottom: 20px;
    display: flex;
    align-items: center;

    .label {
      width: 60px;
      color: $gray-dark;
      font-size: 14px;
    }

    .value {
      flex: 1;
      font-size: 14px;
    }
  }

  // 规格选择
  .sku-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;

    .sku-option {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: $white;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        border-color: $primary;
      }

      &.active {
        border-color: $primary;
        color: $primary;
        background-color: rgba(255, 68, 0, 0.05);
      }
    }
  }

  // 数量控制
  .quantity-control {
    display: flex;
    align-items: center;

    .btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: $white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:disabled {
        background-color: $gray-light;
        cursor: not-allowed;
        color: $gray;
      }
    }

    input {
      width: 60px;
      height: 30px;
      border-top: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      border-left: none;
      border-right: none;
      text-align: center;
      outline: none;
    }
  }

  // 操作按钮
  .product-actions {
    display: flex;
    gap: 16px;
    margin-top: 30px;

    .btn {
      flex: 1;
      height: 50px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;

      &.add-to-cart {
        background-color: #fff0e6;
        color: $primary;

        &:hover {
          background-color: #ffe0cc;
        }
      }

      &.buy-now {
        background-color: $primary;
        color: white;

        &:hover {
          background-color: $primary-light;
        }
      }
    }
  }
}

// 详情标签页
.product-detail-tabs {
  background-color: $white;
  border-radius: 8px;
  overflow: hidden;

  .tabs-nav {
    display: flex;
    border-bottom: 1px solid $gray-light;

    .tab-btn {
      padding: 16px 24px;
      background: none;
      border: none;
      font-size: 16px;
      font-weight: 500;
      color: $gray-dark;
      cursor: pointer;
      position: relative;

      &.active {
        color: $primary;

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: $primary;
        }
      }

      &:hover:not(.active) {
        color: $primary;
        background-color: $gray-light;
      }
    }
  }

  .tabs-content {
    padding: 20px;

    .detail-content {
      .detail-img {
        width: 100%;
        height: auto;
        display: block;
      }
    }
  }
}

// 提示框和图标样式复用主页（省略重复代码）
</style>