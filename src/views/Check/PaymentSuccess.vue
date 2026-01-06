<template>
  <div class="success-page">
    <div>
      <Header />
    </div>

    <main class="container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon size="40" color="#1989fa"><Loading /></el-icon>
        <p>正在查询支付结果...</p>
      </div>

      <!-- 订单详情加载状态 -->
      <div v-else-if="orderLoading" class="loading-container">
        <el-icon size="40" color="#1989fa"><Loading /></el-icon>
        <p>正在获取订单详情...</p>
      </div>

      <!--支付状态异常/参数缺失  -->
      <div v-else-if="payStatusError" class="error-container">
        <el-icon size="60" color="#f56c6c"><CircleCloseFilled /></el-icon>
        <h3 class="error-title">{{ errorMsg }}</h3>
        <div class="error-actions">
          <button v-if="isTimeoutError" class="btn-primary" @click="retryPaymentStatus">
            重试查询
          </button>
          <button class="btn-secondary" @click="goToOrderList">
            查看我的订单
          </button>
        </div>
      </div>

      <!-- 支付成功内容区 -->
      <div v-else>
        <!-- 页面标题 + 步骤指示器（与结算页样式一致） -->

        <div class="checkout-steps">
          <div class="step">
            <div class="step-icon">1</div>
            <div class="step-text">确认订单</div>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <div class="step-icon">2</div>
            <div class="step-text">支付</div>
          </div>
          <div class="step-line active"></div>
          <div class="step active">
            <div class="step-icon">3</div>
            <div class="step-text">完成</div>
          </div>
        </div>

        <!-- 支付成功内容区 -->
        <div class="success-content">
          <!-- 1. 成功图标和提示 -->
          <div class="success-section icon-section">
            <div class="success-icon">
              <el-icon size="80" color="#52c41a"><CircleCheckFilled /></el-icon>
            </div>
            <h3 class="success-title">支付成功</h3>
            <p class="success-desc">您的订单已成功支付，我们将尽快为您发货</p>
          </div>

          <!-- 2. 订单信息卡片 -->
          <div class="success-section order-info-card">
            <h3 class="section-title">订单信息</h3>
            <div class="order-detail">
              <div class="info-item">
                <span class="label">订单编号</span>
                <span class="value">{{ order.no }}</span>
              </div>
              <div class="info-item">
                <span class="label">支付时间</span>
                <span class="value">{{ order.paid_at || "刚刚" }}</span>
              </div>
              <div class="info-item">
                <span class="label">支付方式</span>
                <span class="value">{{
                  getPaymentMethodText(order.payment_methods)
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">支付金额</span>
                <span class="value amount">¥{{ order.total_amount }}</span>
              </div>
              <div class="info-item">
                <span class="label">收货地址</span>
                <span class="value">
                  {{ order.address.contact_name }}
                  {{ hidePhone(order.address.contact_phone) }}<br />
                  {{ order.address?.address }}
                </span>
              </div>
            </div>
          </div>

          <!-- 3. 操作按钮卡片 -->
          <div class="success-section action-buttons-card">
            <h3 class="section-title">后续操作</h3>
            <div class="action-buttons">
              <button class="btn-primary" @click="viewOrderDetail">
                查看订单详情
              </button>
              <button class="btn-secondary" @click="goToOrderList">
                返回订单列表
              </button>
              <button class="btn-secondary" @click="continueShopping">
                继续购物
              </button>
            </div>
          </div>

          <!-- 4. 温馨提示 -->
          <div class="success-section tips-section">
            <h3 class="section-title">温馨提示</h3>
            <ul class="tips-list">
              <li>订单将在1-3个工作日内发货，请耐心等待</li>
              <li>发货后您将通过短信和站内信收到通知</li>
              <li>如有任何问题，请联系客服</li>
              <li>收货时请先验货，确认无误后再签收</li>
            </ul>
          </div>
        </div>
      </div>
    </main>

    <div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { CircleCheckFilled, Loading } from "@element-plus/icons-vue";

// 复用公共组件
import Header from "@/components/Layouts/_header.vue";
import Footer from "@/components/Layouts/_footer.vue";

// 接口服务
import { apiGetOrderDetail } from "@/services/orderService";
import { apiVerifyAlipayStatus } from "@/services/payService";

// 定义TS类型
interface Address {
  contact_name: string;
  contact_phone: string;
  address: string;
}

interface Order {
  id: number;
  no: string;
  paid_at: string;
  total_amount: number;
  payment_methods: string;
  address?: Address;
}

// 路由
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const orderLoading = ref(false); // 订单详情加载状态
const payStatusError = ref(false); // 支付状态异常标识
const errorMsg = ref(""); // 异常提示信息
const orderId = ref("");
const isTimeoutError = ref(false); // 是否是超时错误
// 订单数据
const order = ref<Order>({
  id: 0,
  no: "",
  paid_at: "",
  total_amount: 0,
  payment_methods: "",
  address: {
    contact_name: "",
    contact_phone: "",
    address: "",
  },
});

// 定义参数存储的key 统一管理
const STORAGE_KEY = "alipay_pay_callback_params";

// 获取参数，优先url 其次sessionStorage
const getCallbackParams = () => {
  // 从url查询参数中获取
  const urlParams = {
    out_trade_no: route.query.out_trade_no as string,
    trade_no: route.query.trade_no as string,
    sign: route.query.sign as string,
  };
  if (urlParams.out_trade_no) {
    // 首次进入： 存入sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(urlParams));
    return urlParams;
  }

  // url中无参数，从sessionStorage中获取
  const storageParams = sessionStorage.getItem(STORAGE_KEY);
  if (storageParams) {
    return JSON.parse(storageParams);
  }

  // 均无参数 返回空
  return { out_trade_no: "", trade_no: "", sign: "" };
};

// 计算属性：获取商户订单号
const outTradeNo = computed(() => {
  const params = getCallbackParams();
  return params.out_trade_no;
});

// 获取订单详情
const getOrderDetail = async () => {
  try {
    orderLoading.value = true;
    const { data } = await apiGetOrderDetail(Number(orderId.value));
    order.value = data;
    loading.value = false;
  } catch (error) {
    ElMessage.error("获取订单信息失败");
    // 在获取订单详情失败时，不跳转到订单列表，让用户可以选择重试
    payStatusError.value = true;
    errorMsg.value = "获取订单详情失败，请点击重试按钮重新获取";
    loading.value = false;
  } finally {
    orderLoading.value = false;
  }
};

// 验证支付状态的核心逻辑
const verifyPayStatus = async () => {
  if (!outTradeNo.value) {
    payStatusError.value = true;
    errorMsg.value = "缺少订单编号，无法查询支付结果";
    loading.value = false;
    return;
  }

  try {
    const { data } = await apiVerifyAlipayStatus({
      out_trade_no: outTradeNo.value,
    });
    if (!data.success) {
      // 支付状态异常
      payStatusError.value = true;
      errorMsg.value = `支付状态异常：${data.msg || "订单未支付或交易已关闭"}`;
      loading.value = false;
      return;
    }
    orderId.value = data.data.id;
    // 验证成功后显示订单详情加载状态
    loading.value = false;
    // 延迟获取订单详情
    await getOrderDetail();
  } catch (error: any) {
    // 捕获请求异常
    payStatusError.value = true;
    
    // 检查是否是超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      isTimeoutError.value = true;
      errorMsg.value = "查询支付状态超时，支付宝沙箱环境响应较慢，请重试";
    } else {
      errorMsg.value = error.message || "查询支付状态失败，请稍后重试";
    }
    
    ElMessage.error(errorMsg.value);
    loading.value = false;
  }
};

// 获取支付方式文本
const getPaymentMethodText = (method: string) => {
  switch (method) {
    case "alipay":
      return "支付宝支付";
    case "wechat":
      return "微信支付";
    default:
      return "未知支付方式";
  }
};

// 工具函数：隐藏手机号中间4位
const hidePhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

// 查看订单详情
const viewOrderDetail = () => {
  router.push(`/order/${orderId.value}`);
};

// 返回订单列表
const goToOrderList = () => {
  router.push("/orders");
};

// 继续购物
const continueShopping = () => {
  router.push("/");
};

// 重试支付状态查询
const retryPaymentStatus = async () => {
  payStatusError.value = false;
  isTimeoutError.value = false;
  loading.value = true;
  await verifyPayStatus();
};

// 页面生命周期
onMounted(() => {
  // 设置页面标题
  document.title = "支付成功 - 商城";
  verifyPayStatus();
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/common/common.scss"; // 复用结算页公共变量

// 页面整体样式
.success-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
}

// 页面标题
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: $gray-dark;
}

// 步骤指示器（完全复用结算页样式）
.checkout-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;

    .step-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #ddd;
      color: $gray;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .step-text {
      font-size: 14px;
      color: $gray;
    }

    &.active {
      .step-icon {
        background-color: $primary;
        color: white;
      }
      .step-text {
        color: $primary;
      }
    }
  }

  .step-line {
    flex: 1;
    height: 2px;
    background-color: #ddd;
    max-width: 100px;

    &.active {
      background-color: $primary;
    }
  }
}

// 成功内容区布局
.success-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  // 成功卡片公共样式（统一卡片风格）
  .success-section {
    background-color: $white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    // 卡片标题（复用结算页section-title样式）
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid $gray-light;
      color: $gray-dark;
    }
  }

  // 1. 成功图标和提示
  .icon-section {
    text-align: center;
    padding: 40px 20px;

    .success-icon {
      margin-bottom: 20px;
    }

    .success-title {
      font-size: 24px;
      font-weight: 600;
      color: #52c41a;
      margin-bottom: 10px;
    }

    .success-desc {
      font-size: 16px;
      color: $gray-dark;
      margin-bottom: 0;
    }
  }

  // 2. 订单信息卡片样式（复用支付页样式）
  .order-info-card {
    .order-detail {
      .info-item {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 100px;
          color: $gray;
          flex-shrink: 0;
        }

        .value {
          color: $gray-dark;
          line-height: 1.5;

          &.amount {
            color: #f56c6c;
            font-weight: 600;
          }
        }
      }
    }
  }

  // 3. 操作按钮卡片
  .action-buttons-card {
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;

      // 主要按钮
      .btn-primary {
        height: 44px;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: darken($primary, 10%);
        }
      }

      // 次要按钮
      .btn-secondary {
        height: 44px;
        background-color: transparent;
        color: $primary;
        border: 1px solid $primary;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: rgba($primary, 0.1);
        }
      }
    }
  }

  // 4. 温馨提示
  .tips-section {
    .tips-list {
      padding-left: 20px;
      margin: 0;

      li {
        margin-bottom: 8px;
        font-size: 14px;
        color: $gray-dark;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 加载状态样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .el-icon {
    margin-bottom: 16px;
    animation: rotate 2s linear infinite;
  }

  p {
    font-size: 16px;
    color: $gray-dark;
    margin: 0;
  }
}

// 错误状态样式
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .el-icon {
    margin-bottom: 16px;
  }

  .error-title {
    font-size: 18px;
    font-weight: 600;
    color: $gray-dark;
    margin-bottom: 20px;
    text-align: center;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 200px;

    button {
      width: 100%;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 移动端响应式（与结算页一致）
@media (max-width: 768px) {
  .success-content {
    .action-buttons-card {
      .action-buttons {
        .btn-primary,
        .btn-secondary {
          width: 100%;
        }
      }
    }
  }
}
</style>
