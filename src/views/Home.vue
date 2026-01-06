<!-- 主页 -->
<template>
  <div class="mall-home">
	
	<!-- 导航栏 -->
	<Header
		v-model:show-search="showSearch"
		v-model:show-mobile-menu="showMobileMenu"
	>
		<template #nav>
			<nav class="main-nav hidden md:flex" ref="navbarRef">
			  <ul class="nav-list">
			    <li class="nav-item"><router-link to="/" :class="{ active: activeSection === ''}" @click.prevent="scrollToSection('')">首页</router-link></li>
			    <li class="nav-item"><a href="#category" :class="{ active: activeSection === 'category'}" @click.prevent="scrollToSection('category')">分类</a></li>
			    <li class="nav-item"><a href="#hot" :class="{ active: activeSection === 'hot'}" @click.prevent="scrollToSection('hot')">热卖</a></li>
			    <li class="nav-item"><a href="#discount" :class="{ active: activeSection === 'discount'}" @click.prevent="scrollToSection('discount')">优惠</a></li>
				<li class="nav-item"><a href="#new"  :class="{ active: activeSection === 'new'}"  @click.prevent="scrollToSection('new')">新品</a></li>
			  </ul>
			</nav>
		</template>
		
		<template #icon>
			<div class="nav-actions">
			  <button class="action-btn search-btn" @click="clickSearch()">
			    <i class="icon-search"></i>
			  </button>
			  <button @click="goCart" class="action-btn cart-btn">
			    <i class="icon-cart"></i>
			    <span class="cart-count">3</span>
			  </button>
						
			  <!-- 修改用户按钮为下拉菜单 -->
			    <!-- <div class="user-menu"> -->
			      <!-- <button class="action-btn user-btn" @click="showUserMenu = !showUserMenu"> -->
			        <!-- <i class="icon-user"></i> -->
			        <!-- 显示用户名（如果已登录） -->
			        <!-- <span class="user-name" v-if="user">{{ user.name || user.email.split('@')[0] }}</span> -->
			      <!-- </button> -->
			      
			      <!-- 用户下拉菜单 -->
			      <!-- <div class="user-dropdown" v-if="showUserMenu">
			        <ul>
			          <li @click="goUserCenter">
			            <i class="icon-user-center"></i> 个人中心
			          </li>
			          <li @click="logout">
			            <i class="icon-logout"></i> 退出登录
			          </li>
			        </ul>
			      </div>
			    </div> -->
				
			  <!-- 移动端菜单按钮 -->
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

    <main>
      <!-- 修复后的轮播图 -->
      <section class="banner">
        <!-- 轮播容器（限制显示区域） -->
        <div class="banner-container">
          <!-- 轮播轨道（所有图片横向排列） -->
          <div class="banner-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div class="banner-slide" v-for="(item, index) in bannerList" :key="index">
              <a href="#">
                <img :src="item.imgUrl" :alt="item.title" class="banner-img">
              </a>
            </div>
          </div>
        </div>

        <!-- 轮播指示器 -->
        <div class="banner-indicators">
          <button 
            v-for="(item, index) in bannerList" 
            :key="index"
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index"
          ></button>
        </div>

        <!-- 左右切换按钮 -->
        <button class="banner-prev" @click="prevSlide">
          <i class="icon-prev"></i>
        </button>
        <button class="banner-next" @click="nextSlide">
          <i class="icon-next"></i>
        </button>
      </section>

      <!-- 分类导航 -->
      <section class="category" id="category">
        <div class="container">
          <h2 class="section-title">商品分类</h2>
          <div class="category-list">
            <a href="#" class="category-item" v-for="(item) in categoryList" :key="item.id" @click="goList(item.id)">
              <div class="category-icon">
                <img :src="item.icon" :alt="item.name">
              </div>
              <span class="category-name">{{ item.name }}</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 热门商品 -->
      <section class="hot-products" id="hot">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">热门推荐</h2>
            <a  class="section-more" @click="more('hot')">查看全部</a>
          </div>

          <div class="product-grid">
            <div class="product-card" v-for="(product) in hotProducts" :key="product.id" @click="goDetail(product.id)">
              <div class="product-img">
                <a href="#">
                  <img :src="product.image" :alt="product.title">
                </a>
                <button class="product-add" @click="addToCart(product)">
                  <i class="icon-cart"></i>
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.title }}</h3>
                <div class="product-price">
                  <span class="price-current">¥{{ product.price == product.final_price ? product.price : product.final_price  }}</span>
                  <span class="price-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                </div>
                <div class="product-rating">
                  <i class="icon-star" v-for="n in 5" :key="n" :class="{ active: n <= product.rating }"></i>
                  <span class="rating-count">({{ product.review_count }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 限时折扣 -->
      <section class="flash-sale" id="discount">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">限时折扣</h2>
            <div class="countdown">
              <span class="countdown-label">剩余时间：</span>
              <div class="countdown-time">
                <span class="time-item">{{ hours }}</span>
                <span class="time-colon">:</span>
                <span class="time-item">{{ minutes }}</span>
                <span class="time-colon">:</span>
                <span class="time-item">{{ seconds }}</span>
              </div>
            </div>
            <a  @click="more('discount')" class="section-more">更多折扣</a>
          </div>

          <div class="product-grid">
            <div class="product-card"  @click="goDetail(product.id)" v-for="(product) in flashSaleProducts" :key="product.id">
              <div class="product-tag">限时</div>
              <div class="product-img">
                <a href="#">
                  <img :src="product.image" :alt="product.title">
                </a>
                <button class="product-add" @click="addToCart(product)">
                  <i class="icon-cart"></i>
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.title }}</h3>
                <div class="product-price">
                  <span class="price-current">¥{{ product.final_price }}</span>
                  <span class="price-original">¥{{ product.price }}</span>
                </div>
                <div class="product-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: salePercent(product.sold_count, product.total) + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ salePercent(product.sold_count, product.total) }}% 已售</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 新品上市 -->
      <section class="new-arrivals" id="new">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">新品上市</h2>
            <a  @click="more('new')" class="section-more">查看全部</a>
          </div>

          <div class="product-grid">
            <div class="product-card"  @click="goDetail(product.id)"  v-for="(product) in newProducts" :key="product.id">
              <div class="product-tag">新品</div>
              <div class="product-img">
                <a href="#">
                  <img :src="product.image" :alt="product.title">
                </a>
                <button class="product-add" @click="addToCart(product)">
                  <i class="icon-cart"></i>
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.title }}</h3>
                <div class="product-price">
                  <span class="price-current">¥{{ product.price }}</span>
                </div>
                <div class="product-rating">
                  <i class="icon-star" v-for="n in 5" :key="n" :class="{ active: n <= product.rating }"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
	
	<!--  返回键 -->
	<button 
	  class="back-to-top" 
	  @click="scrollToTop" 
	  :class="{ visible: showBackToTop }"
	  aria-label="回到顶部"
	>
	  <i class="icon-arrow-up"></i>
	</button>


    <!-- 页脚 -->
    <Footer/>

    <!-- 加入购物车提示 -->
    <div class="toast" v-if="showToast">
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { ElNotification, ElMessage } from 'element-plus';
import {  useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Header from '@/components/Layouts/_header.vue'
import Footer from '@/components/Layouts/_footer.vue' 
import {apiGetCategories} from '@/services/categoryService'
import {apiGetProducts} from '@/services/productService'
import { useSearchStore } from '@/stores/searchStore';
import { tr } from 'element-plus/es/locales.mjs';

const searchStore = useSearchStore()

const router = useRouter();


onMounted(() => {
	getCategories()
	getHotProduct()
	getFlashSaleProduct()
	getNewProducts()

	
	handleScroll()
	window.addEventListener('scroll', handleScroll)
	
	// 组件卸载时移除监听
	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll);
	})
})



watch (
	() => searchStore.searchQuery,
	(newQuery) => {
		// 仅再搜索框显示且有搜索词时生效（避免误触发）
		if (showSearch.value && newQuery.trim()) {
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


// 用户相关
const authStore = useAuthStore();
const user = ref(authStore.user);
const showUserMenu = ref(false)

// 导航栏相关
const showSearch = ref(false)
const showMobileMenu = ref(false)
// 获取导航栏DOM引用（用于滚动样式）
const navbarRef = ref<HTMLElement | null>(null);
// 点击搜索按钮
const clickSearch = () => {
	showSearch.value = !showSearch.value
	if (showSearch.value) {
		searchStore.setSearchQuery('') // 打开搜索框时清空历史搜索词
	}
}
// 记录的确激活的导航项 （对应区块ID）
const activeSection = ref('')
// 计算的确可视区域的区块
const getCurrentSection = () => {
	// 滚动位置 + 导航高度（避免被导航遮挡）
	const scrollTop = window.scrollY + 100;
	for (const section of ['', 'category', 'hot', 'discount', 'new']) {
		const element = document.getElementById(section)
		if (element) {
			const { offsetTop, offsetHeight } = element;
			// 判断当前滚动位置是否再该区域范围内
			if (scrollTop >= offsetTop && scrollTop < offsetTop + offsetHeight) {
				return section;
			}
		}
	}
	// 不在任何区块且不在顶部，保持上一个状态
	return '';
}
// 平滑滚动到指定区域
const scrollToSection = (id: string) => {
	if (id === '') {
		window.scrollTo({ top:0, behavior: 'smooth' })
	} else {
		const element = document.getElementById(id);
		if (element) {
			const targetTop = element.offsetTop - 20;
			window.scrollTo({
				top: targetTop,
				behavior: 'smooth' // 平滑滚动特效
			});
		}
	}
}



/* 返回键相关 */ 
const showBackToTop = ref(false)
// 滚动到顶部
const scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	})
}
// 监听返回键何时出现
const handleScroll = () => {
  console.log('滚动位置:', window.scrollY); // 确认滚动时是否打印
  console.log('按钮显示状态:', showBackToTop.value); // 观察状态变化
  // 更新激活区块
  activeSection.value = getCurrentSection();
  
  // 新增：控制回到顶部按钮显示（滚动超过300px时显示）
  showBackToTop.value = window.scrollY > 300;
  
  // 导航栏滚动特效
  if (window.scrollY > 100) {
    navbarRef.value?.classList.add('scrolled');
  } else {
    navbarRef.value?.classList.remove('scrolled');
  }
};


// 轮播图数据
const bannerList = reactive([
  {
    imgUrl: 'https://picsum.photos/id/26/1200/400',
    title: '夏季新品促销'
  },
  {
    imgUrl: 'https://picsum.photos/id/28/1200/400',
    title: '限时折扣活动'
  },
  {
    imgUrl: 'https://picsum.photos/id/29/1200/400',
    title: '新品上市专场'
  }
]);

// 轮播图状态
const currentSlide = ref(0);
let bannerTimer: NodeJS.Timeout | null = null;

// 轮播图切换 左
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % bannerList.length;
};
// 轮播图切换 右
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + bannerList.length) % bannerList.length;
};
// 自动轮播
const startBannerTimer = () => {
  bannerTimer = setInterval(nextSlide, 5000);
};
// 停止自动轮播
const stopBannerTimer = () => {
  if (bannerTimer) clearInterval(bannerTimer);
};

// 分类数据
const categoryList = ref([]);
const getCategories = async () => {
	try {
		const {data} = await apiGetCategories({
			type: 'icon'
		});
		categoryList.value = data
		console.log(data);
	} catch {
		ElMessage.error('分类数据失败，请您重试') 
	}
}

// 热门商品数据
const hotProducts = ref([]);
const getHotProduct = async () => {
	try {
		const {data} = await apiGetProducts({
			type: 'hot',
			limit: 4,
		});
		hotProducts.value = data.data
		console.log(data);
	} catch {
		ElMessage.error('热门商品获取失败，请您重试') 
	}
}


// 限时折扣商品
const flashSaleProducts = ref([]);
const getFlashSaleProduct = async () => {
	try {
		const {data:{data}} = await apiGetProducts({
			type: 'discount',
			limit: 4,
		});
		flashSaleProducts.value = data
		console.log(data);
	} catch {
		ElMessage.error('折扣商品获取失败，请您重试') 
	}
}
const salePercent = (soldCount: number, totalStock: number) => {
	if (totalStock === 0) return 0; // 避免除以0
	const percent = (soldCount / totalStock) * 100;
	return Math.min(Math.round(percent), 100); // 最多100%
}


// 新品上市
const newProducts = ref([]);
const getNewProducts = async () => {
	try {
		const {data:{data}} = await apiGetProducts({
			type: 'new',
			limit: 4,
		});
		newProducts.value = data
		console.log(data);
	} catch {
		ElMessage.error('折扣商品获取失败，请您重试') 
	}
}

// 倒计时功能
const endTime = ref(new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000));
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

const updateCountdown = () => {
  const now = new Date().getTime();
  const diff = endTime.value.getTime() - now;
  
  if (diff <= 0) {
    hours.value = 0;
    minutes.value = 0;
    seconds.value = 0;
    return;
  }
  
  hours.value = Math.floor(diff / (1000 * 60 * 60));
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000);
};

let countdownTimer: NodeJS.Timeout | null = null;

// 加入购物车提示
const showToast = ref(false);
const toastMessage = ref('');

const addToCart = (product: any) => {
  toastMessage.value = `已加入购物车: ${product.name}`;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};


// 生命周期
onMounted(() => {
  // 启动轮播
  startBannerTimer();

  // 启动倒计时
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  // 清理定时器
  stopBannerTimer();
  if (countdownTimer) clearInterval(countdownTimer);
});

// 去购物车
const goCart = () => {
	router.push('/cart')
} 

// // 去个人中心
// const goUserCenter = () => {
// 	router.push('/user')
// }

// // 退出登录
// const logout = () => {
// 	// 调用 authStore 的logout 方法清除用户信息和token
// 	authStore.logout();
// }

// 前往详情页
const goDetail = (id:number) => {
	router.push({
		name: 'Detail',
		params: {id}
	})
}

const goList = (id: number) => {
	router.push({
		name: 'List',
		query: {
			c: id
		}
	})
}

const more = (type: string) => {
	router.push({
		name: 'List',
		query: {
			t: type
		}
	})
}

</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss';


// 轮播图（重点修复部分）
.banner {
  position: relative;
  width: 100%;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 8px;

  // 轮播容器：限制显示区域，超出部分隐藏
  .banner-container {
    width: 100%;
    overflow: hidden;
    position: relative;
    padding-top: 30%; // 固定宽高比（约4:1），避免图片变形
  }

  // 轮播轨道：所有图片横向排列
  .banner-track {
    display: flex; // 关键：让子元素横向排列
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%; // 轨道宽度 = 容器宽度
    transition: transform 0.5s ease; // 平滑过渡动画
  }

  // 单张幻灯片：占满容器宽度
  .banner-slide {
    flex-shrink: 0; // 禁止压缩
    width: 100%; // 每张图片宽度 = 容器宽度
    height: 100%;
  }

  // 轮播图片
  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover; // 图片自适应填充，不拉伸
    display: block;
  }

  // 指示器
  .banner-indicators {
    position: absolute;
    bottom: 16px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    z-index: 10;

    button {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.6);
      border: none;
      cursor: pointer;

      &.active {
        background-color: $white;
        width: 24px;
        border-radius: 4px;
      }
    }
  }

  // 切换按钮
  .banner-prev, .banner-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.2);
    color: $white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 10;

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  .banner-prev {
    left: 16px;
  }

  .banner-next {
    right: 16px;
  }

  &:hover .banner-prev,
  &:hover .banner-next {
    opacity: 1;
  }
}

// 分类导航
.category {
  padding: 32px 0;
  background-color: $white;

  .section-title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 24px;
    color: $gray-dark;
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;

    .category-item {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;

      .category-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: $gray-light;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        img {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }
      }

      .category-name {
        color: $gray-dark;
        font-size: 14px;
        text-align: center;
      }

      &:hover .category-icon {
        background-color: rgba(255, 68, 0, 0.1);
      }

      &:hover .category-name {
        color: $primary;
      }
    }
  }
}

// 通用区块标题
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  .section-title {
    font-size: 22px;
    color: $gray-dark;
    font-weight: 600;
  }

  .section-more {
    color: $primary;
    text-decoration: none;
    font-size: 14px;
    display: flex;
    align-items: center;
	cursor: pointer;

    &:after {
      content: '→';
      margin-left: 4px;
      font-size: 12px;
    }

    &:hover {
      text-decoration: underline;
    }
  }
}

// 商品网格
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

// 商品卡片
.product-card {
  background-color: $white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;

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

      &:hover {
        background-color: $primary-light;
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
        color: $red;
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

  .product-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 8px;
    font-size: 12px;
    color: white;
    border-radius: 4px;
    z-index: 1;
  }

  &:has(.product-tag:contains('限时')) .product-tag {
    background-color: $red;
  }

  &:has(.product-tag:contains('新品')) .product-tag {
    background-color: #00b42a;
  }
}

// 热门推荐
.hot-products {
  padding: 32px 0;
  background-color: $gray-light;
  max-height: 480px;
  height:480px;
  overflow: hidden;
  .div{
	  margin-bottom: 20px;
  }
}

// 限时折扣
.flash-sale {
  padding: 32px 0;
  background-color: #fff5f5;
  max-height: 490px;
  height:490px;
  overflow: hidden;

  .countdown {
    display: flex;
    align-items: center;

    .countdown-label {
      font-size: 14px;
      color: $gray-dark;
      margin-right: 8px;
    }

    .countdown-time {
      display: flex;
      align-items: center;

      .time-item {
        width: 32px;
        height: 32px;
        background-color: $gray-dark;
        color: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }

      .time-colon {
        margin: 0 4px;
        color: $gray-dark;
        font-weight: 600;
      }
    }
  }

  .product-progress {
    margin-top: 8px;

    .progress-bar {
      height: 6px;
      background-color: #ffeeee;
      border-radius: 3px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background-color: $red;
      }
    }

    .progress-text {
      font-size: 12px;
      color: $red;
      margin-top: 4px;
    }
  }
}

// 新品上市
.new-arrivals {
  padding: 32px 0;
  background-color: $white;
  max-height: 500px;
  height: 500px;
  overflow: hidden;
}



// 加入购物车提示
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 32px;
  font-size: 14px;
  z-index: 1000;
  animation: fadeInOut 2s;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  80% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, 20px); }
}

// 回到顶部按钮
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: $primary;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 68, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  transform: translateY(20px);
  z-index: 9999;
  color: #fff;

  // 显示状态
  &.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  // 悬停效果
  &:hover {
    background-color: $primary-light;
    transform: translateY(-3px);
  }
}

// 箭头图标（如果需要自定义）
.icon-arrow-up {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M18 15l-6-6-6 6'/%3E%3C/svg%3E") no-repeat center;
}




</style>