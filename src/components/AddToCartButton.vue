<template>
  <button 
    class="product-add" 
    @click.stop="handleAddToCart"
    :disabled="loading"
  >
    <i class="icon-cart"></i>
    <span class="loading-spinner" v-if="loading"></span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useCartStore } from '@/stores/cartStore'; // 假设使用Pinia状态管理

// 组件接收的参数
const props = defineProps<{
  product: {
    id: number;
    title: string;
    image: string;
    // 其他商品必要属性
  };
  // 可选：自定义添加数量，默认为1
  quantity?: number;
}>();

// 组件发出的事件
const emit = defineEmits<{
  (e: 'added', product: any, quantity: number): void;
  (e: 'error', error: string): void;
}>();

// 状态管理
const loading = ref(false);
const cartStore = useCartStore();
let animationContainer: HTMLElement | null = null;

// 初始化动画容器
onMounted(() => {
  // 确保全局只有一个动画容器
  animationContainer = document.querySelector('.cart-animation-container');
  if (!animationContainer) {
    animationContainer = document.createElement('div');
    animationContainer.className = 'cart-animation-container';
    document.body.appendChild(animationContainer);
  }
});

// 处理添加到购物车
const handleAddToCart = async () => {
  const quantity = props.quantity || 1;
  
  try {
    loading.value = true;
    
    // 1. 按钮点击反馈动画
    const button = event?.currentTarget as HTMLButtonElement;
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 300);
    
    // 2. 调用API添加到购物车
    await cartStore.addItem(props.product, quantity);
    
    // 3. 触发飞入购物车动画
    startFlyAnimation(button);
    
    // 4. 显示成功消息并触发事件
    ElMessage.success(`${props.product.title} 已加入购物车`);
    emit('added', props.product, quantity);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '添加失败，请重试';
    ElMessage.error(errorMsg);
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};

// 商品飞入购物车动画
const startFlyAnimation = (button: HTMLElement) => {
  // 创建商品图片克隆
  const imgClone = document.createElement('img');
  imgClone.src = props.product.image;
  imgClone.classList.add('cart-fly');
  imgClone.onerror = () => {
    imgClone.src = 'https://picsum.photos/32/32'; // 备用图片
  };
  
  animationContainer?.appendChild(imgClone);
  
  // 获取位置信息
  const buttonRect = button.getBoundingClientRect();
  const cartIcon = document.querySelector('.cart-btn');
  
  if (!cartIcon) {
    imgClone.remove();
    return;
  }
  
  const cartRect = cartIcon.getBoundingClientRect();
  
  // 设置初始位置
  imgClone.style.left = `${buttonRect.left}px`;
  imgClone.style.top = `${buttonRect.top}px`;
  
  // 触发飞行动画
  setTimeout(() => {
    // 目标位置（购物车图标中心）
    imgClone.style.left = `${cartRect.left + cartRect.width/2 - 16}px`;
    imgClone.style.top = `${cartRect.top + cartRect.height/2 - 16}px`;
    imgClone.style.opacity = '0';
    imgClone.style.transform = 'scale(0.2)';
  }, 10);
  
  // 动画结束后清理
  setTimeout(() => {
    imgClone.remove();
    // 触发购物车数量更新动画
    updateCartCount();
  }, 800);
};

// 更新购物车数量动画
const updateCartCount = () => {
  const countEl = document.querySelector('.cart-count') as HTMLSpanElement;
  if (countEl) {
    countEl.classList.add('count-change');
    // 数量变化由状态管理负责，这里只处理动画
    setTimeout(() => countEl.classList.remove('count-change'), 500);
  }
};
</script>

<style lang="scss" scoped>
.product-add {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ff4400;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
  z-index: 10;

  &:hover {
    background-color: #ff6733;
  }

  &.clicked {
    transform: scale(1.2);
    opacity: 0.8;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

// 加载动画
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 全局动画样式需要穿透scoped
::v-deep .cart-fly {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  z-index: 10000;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform: scale(1);
  opacity: 1;
  pointer-events: none;
}

::v-deep .cart-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

::v-deep .cart-count {
  &.count-change {
    animation: countPulse 0.5s ease;
  }
}

@keyframes countPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.5); color: white; }
  100% { transform: scale(1); }
}
</style>
