<template>
  <div class="pay-page">
    <!-- 复用结算页公共头部 -->
    <div>
      <Header />
    </div>

    <main class="container">
      <div class="checkout-steps">
        <div class="step">
          <div class="step-icon">1</div>
          <div class="step-text">确认订单</div>
        </div>
        <div class="step-line active"></div>
        <div class="step active">
          <div class="step-icon">2</div>
          <div class="step-text">支付</div>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon">3</div>
          <div class="step-text">完成</div>
        </div>
      </div>

      <!-- 支付内容区（卡片式布局） -->
      <div class="pay-content">
        <!-- 1. 订单信息卡片 -->
        <div class="pay-section order-info-card">
          <h3 class="section-title">订单信息</h3>
          <div class="order-detail">
            <div class="info-item">
              <span class="label">订单编号</span>
              <span class="value">{{ order.no }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间</span>
              <span class="value">{{ order.created_at }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付状态</span>
              <span class="value status-unpaid">未支付</span>
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

        <!-- 2. 支付方式选择卡片 -->
        <div class="pay-section payment-methods-card">
          <h3 class="section-title">选择支付方式</h3>
          <div class="methods-list">
            <!-- 支付宝支付 -->
            <div
              class="method-item"
              :class="{ active: selectedMethod === 'alipay', disabled: false }"
              @click="selectedMethod = 'alipay'"
            >
              <div class="method-icon alipay"></div>
              <div class="method-info">
                <div class="method-name">支付宝支付</div>
                <div class="method-desc">支持余额、银行卡、花呗等</div>
              </div>
              <div class="method-check">
                <el-radio
                  v-model="selectedMethod"
                  label="alipay"
                  border
                  size="small"
                ></el-radio>
              </div>
            </div>

            <!-- 微信支付 -->
            <div
              class="method-item"
              :class="{ active: selectedMethod === 'wechat', disabled: false }"
              @click="selectedMethod = 'wechat'"
            >
              <div class="method-icon wechat"></div>
              <div class="method-info">
                <div class="method-name">微信支付</div>
                <div class="method-desc">支持微信余额、银行卡、零钱通</div>
              </div>
              <div class="method-check">
                <el-radio
                  v-model="selectedMethod"
                  label="wechat"
                  border
                  size="small"
                ></el-radio>
              </div>
            </div>

            <!-- 银行卡支付（禁用） -->
            <div class="method-item" :class="{ disabled: true }">
              <div class="method-icon bankcard"></div>
              <div class="method-info">
                <div class="method-name">银行卡支付</div>
                <div class="method-desc">暂未开通，敬请期待</div>
              </div>
              <div class="method-check">
                <el-radio
                  v-model="selectedMethod"
                  label="bankcard"
                  border
                  size="small"
                  disabled
                ></el-radio>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 支付金额与操作卡片（右侧固定） -->
        <div class="pay-section amount-operate-card">
          <div class="amount-wrapper">
            <div class="amount-label">应付金额</div>
            <div class="amount-value">¥{{ order.total_amount }}</div>
          </div>

          <!-- 支付超时提示 -->
          <div class="timeout-tip" v-if="!order.closed">
            <el-icon><Clock /></el-icon>
            <span
              >请在
              <span class="countdown" :class="{ warning: countdown < 60 }"
                >{{ countdown }}s</span
              >
              内完成支付</span
            >
          </div>

          <!-- 确认支付按钮 -->
          <button
            class="btn-confirm-pay"
            @click="showPayModal"
            :disabled="
              !selectedMethod ||
              countdown <= 0 ||
              isPaymentLoading ||
              order.closed
            "
            :class="{ loading: isPaymentLoading }"
          >
            <span v-if="isPaymentLoading">正在处理...</span>
            <span v-else-if="order.closed" style="color: #ff7d00"
              >订单已取消</span
            >
            <span v-else>确认支付</span>
          </button>

          <!-- 订单操作链接 -->
          <div class="order-actions">
            <a
              @click="cancelOrder"
              v-if="!order.closed"
              class="action-link cancel"
              >取消订单</a
            >
            <a @click="goBack" class="action-link back">返回订单列表</a>
          </div>
        </div>
      </div>
    </main>

    <!-- 复用结算页公共底部 -->
    <div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox, ElProgress, ElIcon } from "element-plus";
import { Clock } from "@element-plus/icons-vue";

// 复用结算页公共组件
import Header from "@/components/Layouts/_header.vue";
import Footer from "@/components/Layouts/_footer.vue";

// 接口服务（实际项目替换为真实接口）
import { apiCloseOrder, apigetAlipayPayUrl, apiVerifyAlipayStatus } from "@/services/payService";

import { apiCancelOrder } from "@/services/orderService";

import { apiGetOrderDetail } from "@/services/orderService";

// 路由与订单数据
const route = useRoute();
const router = useRouter();
const orderId = route.params.id as string; // 从结算页携带订单ID
// 支付相关状态
const selectedMethod = ref("alipay"); // 默认选中支付宝
const payModalVisible = ref(false);
const countdown = ref(180); // 3分钟支付超时
const checkProgress = ref(0); // 支付结果查询进度
const isPaymentLoading = ref(false); // 支付按钮加载状态
let countdownTimer: NodeJS.Timeout | null = null;
let checkTimer: NodeJS.Timeout | null = null;

const order = ref({
  no: "",
  created_at: "",
  total_amount: 0,
  closed: false,
  address: {
    contact_name: "",
    contact_phone: "",
    address: "",
  }, // 确保 address 初始是个空对象，而非 undefined
  // 之前可能写成了 address: undefined 或未定义 address
});

// 支付弹窗标题（根据选中方式动态变化）
const getPayModalTitle = computed(() => {
  return `${selectedMethod.value === "alipay" ? "支付宝" : "微信"}扫码支付`;
});

// 工具函数：隐藏手机号中间4位
const hidePhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

// 获取订单详情
const getOrderDetail = async () => {
  try {
    const { data } = await apiGetOrderDetail(Number(orderId));
    order.value = data as any;
    countdown.value = (data as any).remaining_time || 180;
    
    // 检查订单状态
    if (order.value.paid_at || order.value.closed) {
      // 如果订单已支付或已关闭，停止倒计时
      countdown.value = 0;
      if (order.value.paid_at) {
        ElMessageBox.alert(
          "该订单已支付，请查看订单详情",
          "提示",
          {
            confirmButtonText: "查看订单",
            callback: () => router.push("/orders"),
          }
        );
      }
    } else {
      // 如果订单显示未支付，再次查询支付宝确认支付状态
      try {
        const payStatusRes = await apiVerifyAlipayStatus({
          out_trade_no: order.value.no
        });
        
        // 如果支付宝显示已支付但本地未更新
        if (payStatusRes.success && payStatusRes.data.success) {
          // 重新获取订单详情，以获取最新状态
          const { data: updatedOrder } = await apiGetOrderDetail(Number(orderId));
          order.value = updatedOrder;
          
          if (order.value.paid_at) {
            countdown.value = 0;
            ElMessageBox.alert(
              "该订单已支付，订单状态已更新",
              "支付成功",
              {
                confirmButtonText: "查看订单",
                callback: () => router.push("/orders"),
              }
            );
          }
        }
      } catch (payStatusError) {
        // 忽略支付状态查询错误，可能是网络问题
        console.warn("支付状态查询失败，继续使用本地状态", payStatusError);
      }
    }
  } catch (error) {
    ElMessage.error("获取订单信息失败");
    // router.push("/orders");
  }
};

// 超时关闭订单
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!);
      // 调用你实际的关闭订单接口
      apiCloseOrder(Number(orderId))
        .then(() => {
          ElMessageBox.alert("支付超时，订单已自动关闭", "提示", {
            confirmButtonText: "确定",
            callback: () => router.push("/orders"),
          });
        })
        .catch(() => {
          ElMessageBox.alert("支付超时，订单关闭失败，请手动刷新", "提示", {
            confirmButtonText: "确定",
            callback: () => router.push("/orders"),
          });
        });
      return;
    }
    countdown.value--;
  }, 1000);
};

// 获取支付表单并且发起支付
const showPayModal = async () => {
  try {
    // 先检查支付状态
    const payStatusRes = await apiVerifyAlipayStatus({
      out_trade_no: order.value.no
    });
    
    // 如果支付状态查询成功且已支付
    if (payStatusRes.data && payStatusRes.data.success) {
      // 重新获取订单详情，以获取最新状态
      await getOrderDetail();
      if (order.value.paid_at) {
        ElMessageBox.alert(
          '该订单已经支付成功，订单状态已更新',
          '支付成功',
          {
            confirmButtonText: '查看订单',
            type: 'success'
          }
        ).then(() => {
          router.push(`/orders`);
        });
        return;
      }
    }
    
    // 如果查询支付状态失败，但订单在数据库中显示已支付
    if (payStatusRes.data && !payStatusRes.data.success && payStatusRes.data.msg && payStatusRes.data.msg.includes('支付状态：TRADE_SUCCESS')) {
      // 支付宝返回已支付，但本地状态未更新
      await getOrderDetail();
      if (order.value.paid_at) {
        ElMessageBox.alert(
          '该订单已经支付成功，订单状态已更新',
          '支付成功',
          {
            confirmButtonText: '查看订单',
            type: 'success'
          }
        ).then(() => {
          router.push(`/orders`);
        });
        return;
      }
    }

    // 调用API获取支付表单
    const res = await apigetAlipayPayUrl(Number(orderId));
    console.log("支付响应:", res); // 调试输出

    // 检查响应结构（axios拦截器现在直接返回数据）
    if (res && res.status === 200 && res.data) {
      if (res.data.data.form) {
        // console.log('收到支付表单，长度:', res.data.data.form.length); // 调试输出

        // 直接将表单HTML插入到页面并执行
        // 创建一个临时的div来包含表单HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = res.data.data.form;
        // 插入到body中
        document.body.appendChild(tempDiv);

        // 查找表单并提交
        const form = tempDiv.querySelector("#alipay_submit");
        if (form) {
          console.log("找到支付宝表单，准备提交"); // 调试输出

          // 显示支付提示
          ElMessage.info("正在跳转到支付宝支付页面...");

          // 延迟一下让用户看到提示，然后提交表单
          setTimeout(() => {
            form.submit();
          }, 500);

          // 清理临时元素（延迟清理，确保表单提交完成）
          setTimeout(() => {
            if (document.body.contains(tempDiv)) {
              document.body.removeChild(tempDiv);
            }
          }, 2000);
        } else {
          console.error("未找到支付宝表单"); // 调试输出
          ElMessage.error("支付表单生成失败");
        }
      }
      // 如果返回的是支付链接（兼容性）
      else if (res.data.pay_url) {
        console.log("跳转到支付链接:", res.data.pay_url); // 调试输出
        ElMessage.info("正在跳转到支付宝支付页面...");
        window.location.href = res.data.pay_url;
      } else {
        console.error("响应数据异常:", res); // 调试输出
        ElMessage.error("响应数据格式错误");
      }
    } else {
      console.error("API调用失败:", res); // 调试输出
      ElMessage.error(res?.message || "生成支付链接失败");
    }
  } catch (error: any) {
    console.error("支付请求异常:", error); // 调试输出
    // 捕获请求异常（如网络错误、后端500）
    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      "生成支付链接失败，请重试";
    ElMessage.error(errMsg);
  }
};

// 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm("确定取消订单？取消后库存将返还", "确认取消", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });
    isPaymentLoading.value = true;
    const { data } = await apiCancelOrder(Number(orderId));
    console.log(data, "取消订单");
    ElMessage.success("订单已取消");
    // router.push("/orders");
    getOrderDetail();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("取消订单失败");
  } finally {
    isPaymentLoading.value = false;
  }
};

// 返回订单列表
const goBack = () => router.push("/orders");

// 页面生命周期
onMounted(() => {
  if (orderId == "") {
    router.push({
      name: "Home",
    });
  }
  getOrderDetail();
  startCountdown();
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  if (checkTimer) clearInterval(checkTimer);
});

watch(payModalVisible, (newVal) => {
  if (!newVal && checkTimer) {
    clearInterval(checkTimer);
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/css/common/common.scss" as common; // 复用结算页公共变量（如$primary、$white、$gray等）

// 页面整体样式
.pay-page {
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
  color: common.$gray-dark;
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
      color: common.$gray;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .step-text {
      font-size: 14px;
      color: common.$gray;
    }

    &.active {
      .step-icon {
        background-color: common.$primary;
        color: white;
      }
      .step-text {
        color: common.$primary;
      }
    }
  }

  .step-line {
    flex: 1;
    height: 2px;
    background-color: #ddd;
    max-width: 100px;

    &.active {
      background-color: common.$primary;
    }
  }
}

// 支付内容区布局
.pay-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;

  // 移动端响应式（与结算页一致）
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }

  // 支付卡片公共样式（统一卡片风格）
  .pay-section {
    background-color: common.$white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    // 卡片标题（复用结算页section-title样式）
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid common.$gray-light;
      color: common.$gray-dark;
    }
  }

  // 1. 订单信息卡片样式
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
          color: common.$gray;
          flex-shrink: 0;
        }

        .value {
          color: common.$gray-dark;
          line-height: 1.5;

          &.status-unpaid {
            color: #f56c6c; // 未支付红色提示
          }
        }
      }
    }
  }

  // 2. 支付方式选择卡片样式
  .payment-methods-card {
    .methods-list {
      .method-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border: 1px solid common.$gray-light;
        border-radius: 6px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:last-child {
          margin-bottom: 0;
        }

        // 选中状态（与结算页选择框风格一致）
        &.active {
          border-color: common.$primary;
          background-color: rgba(common.$primary, 0.05);
        }

        // 禁用状态
        &.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        // 支付方式图标（可替换为实际图标）
        .method-icon {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          margin-right: 16px;
          flex-shrink: 0;

          &.alipay {
            background-color: #1677ff; // 支付宝蓝
          }

          &.wechat {
            background-color: #07c160; // 微信绿
          }

          &.bankcard {
            background-color: #ff9f43; // 银行卡橙
          }
        }

        // 支付方式信息
        .method-info {
          flex: 1;

          .method-name {
            font-size: 14px;
            color: common.$gray-dark;
            margin-bottom: 4px;
          }

          .method-desc {
            font-size: 12px;
            color: common.$gray;
          }
        }

        // 单选框容器（右对齐）
        .method-check {
          flex-shrink: 0;
        }
      }
    }
  }

  // 3. 支付金额与操作卡片样式（右侧固定，与结算页总结区对齐）
  .amount-operate-card {
    // 固定定位（移动端取消固定）
    @media (min-width: 993px) {
      position: sticky;
      top: 20px;
      align-self: flex-start;
    }

    // 金额展示区
    .amount-wrapper {
      margin-bottom: 20px;

      .amount-label {
        font-size: 14px;
        color: common.$gray;
        margin-bottom: 8px;
        display: block;
      }

      .amount-value {
        font-size: 24px;
        font-weight: 600;
        color: #f56c6c; // 金额红色突出
      }
    }

    // 超时提示
    .timeout-tip {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: common.$gray;
      margin-bottom: 20px;

      el-icon {
        margin-right: 6px;
        color: #f56c6c;
      }

      .countdown {
        color: #f56c6c;
        font-weight: 500;

        &.warning {
          color: #ff4d4f; // 倒计时小于60秒时加深红色
        }
      }
    }

    // 确认支付按钮（与结算页按钮风格一致）
    .btn-confirm-pay {
      width: 100%;
      height: 44px;
      background-color: common.$primary;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-bottom: 16px;
      position: relative;

      &:disabled {
        background-color: common.$gray-light;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background-color: #ff9f43; //  hover时加深颜色
      }

      &.loading {
        background-color: #ff9f43;

        span {
          animation: pulse 1.5s ease-in-out infinite;
        }
      }
    }

    // 订单操作链接
    .order-actions {
      display: flex;
      justify-content: space-between;
      font-size: 14px;

      .action-link {
        color: common.$primary;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }

        &.cancel {
          color: #f56c6c; // 取消订单红色
        }
      }
    }
  }
}

// 支付弹窗样式（与页面风格统一）
.pay-modal-inner {
  padding: 10px 0;
  .pay-info {
    margin-bottom: 20px;
  }
  .info-line {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
  .amount {
    color: #f56c6c;
    font-weight: 600;
  }
  .warning {
    color: #f56c6c;
    margin-top: 12px;
  }

  // 支付提示
  .pay-tips {
    margin-bottom: 20px;

    .tip-line {
      font-size: 12px;
      color: common.$gray-dark;
      margin-bottom: 8px;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }

      &.text-warning {
        color: #f56c6c;
      }
    }
  }

  // 支付状态进度
  .pay-status {
    .progress-bar {
      margin-bottom: 8px;
    }

    .status-text {
      font-size: 12px;
      color: common.$gray;
      text-align: center;
    }
  }
}

/* 支付宝跳转按钮 */
.btn-goto-alipay {
  width: 100%;
  height: 44px;
  background-color: #1677ff; /* 支付宝蓝 */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-goto-alipay:disabled {
  background-color: #c9daf7;
  cursor: not-allowed;
}
.btn-goto-alipay:hover:not(:disabled) {
  background-color: #0f62d9;
}

// 加载动画
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
