<template>
  <div class="toast-container" ref="container">
    <div 
      v-for="(toast, index) in toasts" 
      :key="toast.id" 
      :class="['toast', `toast-${toast.type}`]"
      :style="{ transform: `translateY(${index * 60}px)` }"
    >
      <div class="toast-icon">
        <i :class="getIconClass(toast.type)"></i>
      </div>
      <div class="toast-content">
        {{ toast.message }}
      </div>
      <div class="toast-close" @click="removeToast(toast.id)">
        <i class="fa fa-times"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, provide, inject, onMounted } from 'vue'

const container = ref(null)
const toasts = reactive([])
const toastId = ref(0)

// 提供全局访问方法
provide('toast', {
  success(message, duration = 3000) {
    addToast('success', message, duration)
  },
  error(message, duration = 3000) {
    addToast('error', message, duration)
  },
  warning(message, duration = 3000) {
    addToast('warning', message, duration)
  },
  info(message, duration = 3000) {
    addToast('info', message, duration)
  }
})

// 获取图标类（需引入 FontAwesome 或替换为其他图标）
const getIconClass = (type) => {
  switch (type) {
    case 'success': return 'fa fa-check-circle';
    case 'error': return 'fa fa-times-circle';
    case 'warning': return 'fa fa-exclamation-circle';
    case 'info': return 'fa fa-info-circle';
    default: return 'fa fa-info-circle';
  }
}

// 添加提示
const addToast = (type, message, duration) => {
  const id = ++toastId.value
  toasts.push({ id, type, message })
  
  // 设置自动移除
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

// 移除提示
const removeToast = (id) => {
  const index = toasts.findIndex(toast => toast.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
  }
}

// 初始化（无需交叉观察器）
onMounted(() => {
  // 空实现，保持生命周期完整性
})
</script>

<style scoped>
/* 样式不变，同上 */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
}

.toast {
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  background-color: white;
  transform: translateY(0);
  opacity: 1;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 200px;
}

/* 其他样式省略（保持和之前一致） */
</style>