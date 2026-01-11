<!-- 购物车 -->
<template>
  <div class="cart-page">
    
    <!-- 导航栏 -->
    <Header
    	v-model:show-search="showSearch"
    	v-model:show-mobile-menu="showMobileMenu"
    >

    	<template #icon>
    		<div class="nav-actions">
    		  <button class="action-btn search-btn" @click="clickSearch">
    		    <i class="icon-search"></i>
    		  </button>
    		  <button class="action-btn cart-btn" @click="$router.push('/cart')">
    		    <i class="icon-cart"></i>
    		    <span class="cart-count">{{ cartStore.totalCount }}</span>
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

      <!-- 购物车为空 -->
      <div class="cart-empty" v-if="cartItems.length === 0">
        <img src="https://picsum.photos/id/20/100/100" alt="购物车为空">
        <p>您的购物车还是空的~</p>
        <button class="btn-go-shopping" @click="$router.push('/')">去逛逛</button>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list" v-else>
        <div class="cart-header">
          <div class="col select-all">
            <label class="checkbox-label">
              <input type="checkbox" v-model="selectAll">
              <span class="checkbox-custom"></span>
              <span class="text">全选</span>
            </label>
          </div>
          <div class="col product-info">商品信息</div>
          <div class="col price">单价</div>
          <div class="col quantity">数量</div>
          <div class="col total">小计</div>
          <div class="col action">操作</div>
        </div>

        <div class="cart-item" v-for="(item) in cartItems" :key="item.id" :class="{ 'cart-item--disabled': item.product_sku.product.on_sale === 0}">
          <div class="col select-item">
            <label class="checkbox-label">
              <input type="checkbox" :disabled="item.product_sku.product.on_sale === 0" v-model="item.selected">
              <span class="checkbox-custom"></span>
            </label>
          </div>
          <div class="col product-info">
            <div class="product-img">
              <img :src="item.product_sku.product.image" :alt="item.product_sku.product.title">
			  <!-- 已下架标签 -->
			  <span v-if="item.product_sku.product.on_sale === 0" class="product-tag">已下架</span>
            </div>
            <div class="product-desc">
              <h3 class="product-name">{{ item.product_sku.product.title }}</h3>
              <p class="product-sku" v-if="item.product_sku">规格：{{ item.product_sku.title }}</p>
            </div>
          </div>
          <div class="col price">¥{{ item.product_sku.price }}</div>
          <div class="col quantity">
            <div class="quantity-control">
              <button class="btn minus" @click="decreaseQuantity(item.id)" :disabled="item.amount <= 1 || item.product_sku.product.on_sale === 0">-</button>
              <input type="number" v-model="item.amount" min="1" :disabled="item.product_sku.product.on_sale === 0">
              <button class="btn plus" @click="increaseQuantity(item.id)" :disabled="item.product_sku.product.on_sale === 0">+</button>
            </div>
          </div>
          <div class="col total">¥{{ (item.product_sku.price * item.amount).toFixed(2) }}</div>
          <div class="col action">
            <button class="btn-delete" @click="removeItem(item.product_sku_id)" :disabled="item.product_sku.product.on_sale === 0"  >删除</button>
          </div>
        </div>

        <!-- 结算区域 -->
        <div class="cart-footer">
          <div class="select-summary">
            <label class="checkbox-label">
              <input type="checkbox" v-model="selectAll">
              <span class="checkbox-custom"></span>
              <span class="text">全选</span>
            </label>
            <button class="btn-delete-selected" @click="deleteSelected">删除选中商品</button>
          </div>
          <div class="total-summary">
            <div class="total-info">
              <p>已选 <span class="selected-count">{{ selectedCount }}</span> 件商品</p>
              <p>合计：<span class="total-price">¥{{ totalPrice.toFixed(2) }}</span></p>
            </div>
            <button class="btn-checkout" @click="goToCheckout" :disabled="selectedCount === 0">
              结算
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <Footer/>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/Layouts/_header.vue'
import Footer from '@/components/Layouts/_footer.vue' 
import { apiAddCart, apiGetCartList, apiDeleteCartProduct } from '@/services/cartService'
import { apiCreateOrders } from '@/services/orderService'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { useSearchStore } from '@/stores/searchStore';
import { useCartStore } from '@/stores/cartStore';

const router = useRouter();
const searchStore = useSearchStore()
const cartStore = useCartStore()

// Header状态管理
const showSearch = ref(false)
const showMobileMenu = ref(false)
const clickSearch = () => {
	showSearch.value = !showSearch.value
	if (showSearch.value) {
		searchStore.setSearchQuery('') // 打开搜索框时清空历史搜索词
	}
}

// 购物车数据
const cartItems = ref([]);
const getCartList = async () => {
	try {
		const {data} = await apiGetCartList()
		cartItems.value = data.map(item => ({
			...item,
			selected: item.product_sku?.product?.on_sale !== 0 
		}));
		cartStore.getTotalCount(cartItems.value)
		console.log(cartItems.value);
	} catch(err) {
		console.error(err);
	}
}
getCartList()

watch(
	() => cartItems.value,
	(newItems) => {
		cartStore.getTotalCount(newItems);
	},
	{ deep: true }
) 

// // 全选状态
const selectAll = ref(false);

// 计算选中数量
const selectedCount = computed(() => {
	// filter 排除掉selected == false的，生成一个新的数组
	// reduce() 对每个iten的amount进行累加
	return cartItems.value.filter(
		item => item.selected
	).reduce((sum, item) => sum + item.amount, 0);
});

// // 计算选中总价
const totalPrice = computed(() => {
  return cartItems.value.filter(
	item => item.selected
  ).reduce((sum, item) => sum + (item.product_sku.price * item.amount), 0)
  
});

// 减少数量
const decreaseQuantity = (id: number) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item && item.amount > 1) {
	  item.amount --
  }
};
// 增加数量
const increaseQuantity = (id: number) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item)
  {
	  item.amount++;
  }
};

// 删除商品
const removeItem = async (id: number) => {
	try {
	   // 显示确认对话框
	   await ElMessageBox.confirm(
		 '确定删除？', 
		 '提示', 
		 { 
			 confirmButtonText:'确定',
			 cancelButtonText: '取消',
			 type: 'warning' ,
		 },
		 )
	   // 用户点击确认后执行删除
		await apiDeleteCartProduct({
			ids:[id]
		}); // 修正函数名拼写
	   
	   // 检查状态码（假设后端使用200或204表示成功）
	     ElMessage.success('删除成功');
	     getCartList(); // 刷新地址列表
	 } catch (error: any) {
	  // 处理用户取消
		if (error?.name === 'canceled') { // Element Plus 取消操作没有code属性
		  return; // 静默处理取消
		}
	   // 处理删除失败
	   ElMessage.error(error.response?.data?.message || '删除失败，请您重试');
	 }
};

// 删除选中商品
const deleteSelected = async () => {
  const selectedIds = cartItems.value.filter(
	item => 
		item.selected &&
		item.product_sku?.product?.on_sale !== 0 &&
		item.product_sku?.product
  ).map(item => item.product_sku_id)
  
  if (selectedIds.length === 0) {
	  ElMessage.warning('请选择要删除的商品')
	  return
  }
  
  try {
	 await ElMessageBox.confirm(
		`确定删除选中的 ${selectedIds.length} 件商品？`,
		'确认删除',
		{type: 'warning'}
	  )
	  
	  // 批量删除
	  await apiDeleteCartProduct({
		  ids:selectedIds
	  })
	  
	  ElMessage.success(`成功删除`)
	  getCartList()
  } catch (err:any) {
	  if (err?.name === 'cancel') {
		  return
	  }
	  console.log(err)
  }
};

// // 更新全选状态
// const updateSelectAll = () => {
//   if (cartItems.length === 0) {
//     selectAll.value = false;
//     return;
//   }
//   selectAll.value = cartItems.every(item => item.selected);
// };

// 监听商品选中状态变化
// cartItems.forEach(item => {
//   watch(() => item.selected, updateSelectAll);
// });



// 2. 监听商品选中状态变化，同步全选框状态
watch(
  // 监听所有可售商品的选中状态（直接监听cartItems的深层变化）
  () => cartItems.value,
  (newItems) => {
    // 过滤出可售商品（添加兜底判断，避免undefined报错）
    const salableItems = newItems.filter(item => 
      item.product_sku?.product?.on_sale !== 0 &&  // 商品可售
      item.product_sku?.product !== undefined      // 避免无效数据
    );

    // 全选状态 = 可售商品存在 且 所有可售商品都被选中
    const allSelected = salableItems.length > 0 && 
      salableItems.every(item => item.selected);

    // 避免重复赋值导致的循环触发
    if (selectAll.value !== allSelected) {
      selectAll.value = allSelected;
    }
  },
  { deep: true }  // 关键：监测数组内元素的深层变化（如selected属性）
);

// 保留全选框变化同步到商品的逻辑，但增加防抖
watch(selectAll, (val) => {
  // 只同步可售商品的选中状态
  cartItems.value.forEach(item => {
    if (item.product_sku?.product?.on_sale !== 0 && item.product_sku?.product) {
      item.selected = val;
    }
  });
});

// 3. 初始化时设置全选状态
onMounted(async () => {
  // 等待购物车数据加载完成后再设置初始状态
  await getCartList(); 
  const salableItems = cartItems.value.filter(item => 
    item.product_sku?.product?.on_sale !== 0 && 
    item.product_sku?.product !== undefined
  );
  selectAll.value = salableItems.length > 0 && salableItems.every(item => item.selected);
});

// 创建订单并跳转到结算页面
const goToCheckout = () => {
  if (selectedCount.value === 0) {
		ElMessage.warning('请选择要结算的商品');
		return;
  };
  // 保存选中商品到本地存储（实际项目用接口提交）
  const checkoutItems = cartItems.value.filter(
		item => item.selected && item.product_sku?.product?.on_sale !== 0 && item.product_sku?.product
	);
	
	if(checkoutItems.length === 0) {
		ElMessage.warning('请选择要结算的商品');
		return;
	}
	
	localStorage.setItem('checkoutItems', JSON.stringify(checkoutItems))
	const loading = ElLoading.service({
		lock: true,
		text: '加载中...',
	})
	setTimeout(() => {
		loading.close()
		router.push({name:'Checkout'})
	},2000)
};


</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss';

	
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
}



main {
  padding: 30px 0;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: $gray-dark;
  }

  // 空购物车
  .cart-empty {
    background-color: $white;
    padding: 60px 0;
    text-align: center;
    border-radius: 8px;

    img {
      width: 100px;
      height: 100px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    p {
      color: $gray;
      margin-bottom: 20px;
      font-size: 16px;
    }

    .btn-go-shopping {
      padding: 10px 20px;
      background-color: $primary;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background-color: #e63900;
      }
    }
  }

  // 购物车列表
  .cart-list {
    background-color: $white;
    border-radius: 8px;
    overflow: hidden;
	min-height:500px;

    .cart-header {
      display: grid;
      grid-template-columns: 60px 1fr 100px 120px 100px 80px;
      padding: 12px 20px;
      background-color: $gray-light;
      font-size: 14px;
      color: $gray-dark;
      border-bottom: 1px solid #eee;

      @media (max-width: 768px) {
        grid-template-columns: 40px 1fr 80px 80px;
        .price, .total { display: none; }
      }
    }
	
	.cart-item--disabled {
	  opacity: 0.6; // 整体降低透明度
	  pointer-events: none; // 禁止整行点击（可选，增强禁用效果）
	}
	
	// 禁用状态下的元素样式补充（可选）
	.cart-item--disabled .product-name {
	  text-decoration: line-through; // 商品名添加删除线
	}
	
	// 禁用按钮和输入框的默认样式增强
	input:disabled, button:disabled {
	  cursor: not-allowed;
	  background-color: #f5f5f5;
	  color: #999;
	}
	

    .cart-item {
      display: grid;
      grid-template-columns: 60px 1fr 100px 120px 100px 80px;
      padding: 20px;
      border-bottom: 1px solid #eee;
      align-items: center;

      &:last-child {
        border-bottom: none;
      }

      @media (max-width: 768px) {
        grid-template-columns: 40px 1fr 80px 80px;
        .price, .total { display: none; }
      }

      .col {
        &.select-item, &.select-all {
          display: flex;
          align-items: center;
        }

        &.product-info {
          display: flex;
          align-items: center;
          gap: 16px;

          .product-img {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            overflow: hidden;
			position: relative;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
			
			.product-tag {
			    position: absolute;
			    top: 8px;
			    right: 8px;
			    padding: 4px 8px;
			    background-color: #999;
			    color: white;
			    font-size: 12px;
			    border-radius: 4px;
			  }
          }

          .product-desc {
            flex: 1;

            .product-name {
              font-size: 14px;
              margin-bottom: 8px;
              color: $gray-dark;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .product-sku {
              font-size: 12px;
              color: $gray;
            }
          }
        }

        &.price, &.total {
          font-size: 14px;
          color: $gray-dark;
        }

        &.quantity {
          .quantity-control {
            display: flex;
            align-items: center;

            .btn {
              width: 24px;
              height: 24px;
              border: 1px solid #ddd;
              background: $white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;

              &:disabled {
                background-color: $gray-light;
                cursor: not-allowed;
                color: $gray;
              }
            }

            input {
              width: 40px;
              height: 24px;
              border-top: 1px solid #ddd;
              border-bottom: 1px solid #ddd;
              border-left: none;
              border-right: none;
              text-align: center;
              font-size: 14px;
              outline: none;
            }
          }
        }

        &.action {
          .btn-delete {
            background: none;
            border: none;
            color: $gray;
            cursor: pointer;
            font-size: 14px;

            &:hover {
              color: $red;
            }
          }
        }
      }
    }

    // 结算区域
    .cart-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background-color: $gray-light;

      .select-summary {
        display: flex;
        align-items: center;
        gap: 20px;

        .btn-delete-selected {
          background: none;
          border: none;
          color: $gray;
          cursor: pointer;
          font-size: 14px;

          &:hover {
            color: $red;
          }
        }
      }

      .total-summary {
        display: flex;
        align-items: center;
        gap: 20px;

        .total-info {
          text-align: right;

          p {
            margin: 5px 0;
            font-size: 14px;

            .selected-count {
              color: $primary;
              font-weight: 600;
            }

            .total-price {
              color: $red;
              font-size: 18px;
              font-weight: 600;
            }
          }
        }

        .btn-checkout {
          padding: 10px 30px;
          background-color: $primary;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;

          &:hover {
            background-color: #e63900;
          }

          &:disabled {
            background-color: #ffb399;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

// 复选框样式
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;

  input {
    display: none;
  }

  .checkbox-custom {
    width: 16px;
    height: 16px;
    border: 1px solid #ddd;
    border-radius: 3px;
    position: relative;

    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      color: white;
      display: none;
    }
  }

  input:checked + .checkbox-custom {
    background-color: $primary;
    border-color: $primary;

    &::after {
      display: block;
    }
  }
}
</style>