<!-- src/views/AlipayReturn.vue -->
<template>
  <div class="alipay-return">
    <el-loading v-if="loading" fullscreen text="正在验证支付结果..."></el-loading>
    <div v-else class="result-container" v-if="!loading">
      <div v-if="success" class="success-icon">
        <el-icon><Check /></el-icon>
      </div>
      <div v-else class="error-icon">
        <el-icon><Close /></el-icon>
      </div>
      <h3 class="result-title">{{ success ? '支付成功' : '支付失败' }}</h3>
      <p class="result-desc">{{ message }}</p>
      <el-button type="primary" @click="goToOrderDetail">查看订单详情</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue';
import { apiVerifyAlipayReturn } from '@/services/payService'; // 新增接口：调用后端 alipayReturn 接口

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const message = ref('');
const orderId = ref('');

// 页面加载时验证支付宝回调参数
onMounted(async () => {
  try {
    // 获取支付宝回调的所有参数（如 out_trade_no、trade_no 等）
    const params = route.query;
    // 调用后端 API 验证参数真实性
    const { data } = await apiVerifyAlipayReturn(params);
    
    if (data.success) {
      success.value = true;
      message.value = '支付成功，正在跳转到订单详情...';
      orderId.value = data.data.out_trade_no; // 从后端返回的订单号
      // 延迟跳转，让用户看到结果
      setTimeout(() => goToOrderDetail(), 2000);
    } else {
      success.value = false;
      message.value = data.message || '支付验证失败';
    }
  } catch (error: any) {
    success.value = false;
    message.value = error.response?.data?.message || '验证失败，请重试';
  } finally {
    loading.value = false;
  }
});

// 跳转到订单详情页
const goToOrderDetail = () => {
  router.push(`/orders/${orderId.value}`);
};
</script>