<template>
  <div class="order-review-page">
    <!-- 复用公共头部 -->
    <Header></Header>

    <main class="container">
      <!-- 页面标题（保持一致的标题样式） -->
      <h2 class="page-title">评价商品</h2>

      <!-- 评价卡片（与订单卡片风格统一） -->
      <div class="review-card">
        <!-- 订单信息头部 -->
        <div class="order-info-header">
          <div class="order-basic">
            <div class="order-no">
              订单编号：<span class="no-text">{{ order.no }}</span>
            </div>
            <div class="order-date">购买时间：{{ order.created_at }}</div>
          </div>
          <div class="order-status">
            <span class="status-text">已收货</span>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 被评价商品信息 -->
        <div class="product-info">
          <div class="product-img">
            <img :src="product.product_img" :alt="product.product_name">
          </div>
          <div class="product-details">
            <div class="product-name">{{ product.product_name }}</div>
            <div class="product-sku">{{ product.sku_name }}</div>
            <div class="product-price">¥{{ (product.price / 100).toFixed(2) }}</div>
          </div>
        </div>

        <!-- 评价表单区域 -->
        <div class="review-form-container">
          <!-- 评分部分 -->
          <div class="review-section">
            <h3 class="section-title">商品评分</h3>
            
            <!-- 总体评分 -->
            <div class="rating-item overall-rating">
              <label class="rating-label">总体评价</label>
              <el-rate
                v-model="rating.allRating"
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                allow-half
              />
            </div>
            
            <!-- 分项评分 -->
            <div class="rating-items-grid">
              <div class="rating-item">
                <label class="rating-label">商品质量</label>
                <el-rate
                v-model="rating.qualityRating"
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                allow-half
              />
              </div>
              
              <div class="rating-item">
                <label class="rating-label">物流速度</label>
                <el-rate
                v-model="rating.logisticsRating"
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                allow-half
              />
              </div>
              
              <div class="rating-item">
                <label class="rating-label">描述相符</label>
                <el-rate
                v-model="rating.descriptionRating"
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                allow-half
              />
              </div>
              
              <div class="rating-item">
                <label class="rating-label">服务态度</label>
                <el-rate
                v-model="rating.serviceRating"
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                allow-half
              />
              </div>
            </div>
          </div>
          
          <!-- 评价内容 -->
          <div class="review-section">
            <h3 class="section-title">评价内容</h3>
            <textarea 
              class="review-textarea" 
              placeholder="请分享您对商品的使用体验、优缺点等详细评价，帮助其他买家做出更明智的选择..."
              v-model="reviews.review"
              @input="updateCharCount"
              maxlength="500"
            ></textarea>
            <div class="char-count">{{ charCount }}/500</div>
          </div>
          
          <!-- 上传图片 -->
          <div class="review-section">
            <h3 class="section-title">上传图片（可选）</h3>
            <p class="upload-tips">上传真实图片，帮助其他买家更直观地了解商品（最多5张）</p>
            
            <div class="image-upload-container">
               <el-upload action="#" list-type="picture-card" :auto-upload="false">
              <el-icon><Plus /></el-icon>

              <template #file="{ file }">
                <div>
                  <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                  <span class="el-upload-list__item-actions">
                    <span
                      class="el-upload-list__item-preview"
                      @click="handlePictureCardPreview(file)"
                    >
                      <el-icon><zoom-in /></el-icon>
                    </span>
                    <span
                      v-if="!disabled"
                      class="el-upload-list__item-delete"
                      @click="handleDownload(file)"
                    >
                      <el-icon><Download /></el-icon>
                    </span>
                    <span
                      v-if="!disabled"
                      class="el-upload-list__item-delete"
                      @click="handleRemove(file)"
                    >
                      <el-icon><Delete /></el-icon>
                    </span>
                  </span>
                </div>
              </template>
            </el-upload>

            <el-dialog v-model="dialogVisible">
              <img w-full style="width: 100%;" :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
            </div>
          </div>
          
          <!-- 提交按钮区域 -->
          <div class="review-actions">
            <button class="btn-cancel" @click="cancelReview">取消</button>
            <button class="btn-submit" @click="submitReview" :disabled="!canSubmit">
              提交评价
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- 复用公共底部 -->
    <Footer></Footer>
    
    <!-- 提交成功弹窗 -->
    <div class="success-modal" v-if="showSuccessModal">
      <div class="modal-content">
        <div class="success-icon">
          <i class="fa fa-check-circle"></i>
        </div>
        <h3 class="success-title">评价提交成功</h3>
        <p class="success-message">感谢您的宝贵评价，您的反馈将帮助其他买家做出更好的选择</p>
        <button class="btn-confirm" @click="goToOrderList">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage,UploadFile  } from 'element-plus';
import { apiOrdersSendReview,apiGetOrderDetail } from '@/services/orderService'
import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue'
// 复用公共组件
import Header from '@/components/Layouts/_header.vue';
import Footer from '@/components/Layouts/_footer.vue';

const router = useRouter();
const orderId = router.currentRoute.value.query.orderId;

// 上传
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const disabled = ref(false)
const handleRemove = (file: UploadFile) => {
  console.log(file)
}
// 预览
const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}
// 下载
const handleDownload = (file: UploadFile) => {
  console.log(file)
}





// 假数据：订单信息
const order = ref([]);
const getOrderDetail = async () => { 
  const {data} = await apiGetOrderDetail(orderId);
}


// 假数据：商品信息
const product = ref({
  id: 5678,
  order_item_id: 98765,
  product_name: '高级无线蓝牙耳机',
  product_img: 'https://picsum.photos/id/26/200/200',
  sku_name: '黑色 | 标准版 | 官方标配',
  price: 299900, // 分
  amount: 1
});


const reviewContent = ref('');
const charCount = ref(0);

//评分
// 总评分
const rating = ref({
  allRating: 0,
  qualityRating: 0, // 质量评分
  logisticsRating: 0, // 物流评分
  descriptionRating: 0, // 描述评分
  serviceRating: 0 // 服务评分
});

const reviews = ref({
  review : ''
})
// 判断是否可以提交
const canSubmit = computed(() => {
  return rating.value.allRating > 0 && reviewContent.value.length >= 10;
});

// 上传图片
const uploadedImages = ref<string[]>([]);

// 提交状态
const submitting = ref(false);
const showSuccessModal = ref(false);

// 初始化字符计数
onMounted(() => {
  updateCharCount();
});


// 更新字符计数
const updateCharCount = () => {
  charCount.value = reviews.value.review.length;
};



// 提交评价
const submitReview = async () => {
  // 验证
  if (!canSubmit.value) {
    if (rating.value === 0) {
      ElMessage.warning('请给出总体评价');
    } else if (reviewContent.value.length < 10) {
      ElMessage.warning('评价内容至少需要10个字符');
    }
    return;
  }
  
  submitting.value = true;
  
  try {
   
    
    // 实际项目中调用API
    // await apiSubmitReview(reviewData);
    
    // 显示成功弹窗
    showSuccessModal.value = true;
  } catch (error) {
    ElMessage.error('评价提交失败，请稍后重试');
    console.error('评价提交失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 取消评价
const cancelReview = () => {
  if (reviewContent.value || overallRating.value > 0 || uploadedImages.value.length > 0) {
    if (confirm('确定要取消评价吗？已输入的内容将会丢失。')) {
      router.back();
    }
  } else {
    router.back();
  }
};

// 前往订单列表
const goToOrderList = () => {
  router.push('/user/orders');
};
</script>

<style lang="scss" scoped>
/* 引入公共样式变量 */
@import '@/assets/css/common/common.scss';

// 页面整体样式
.order-review-page {
  background-color: $gray-light;
  min-height: 100vh;
}



// 页面标题（统一风格）
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: $gray-dark;
}

// 评价卡片（与订单卡片风格统一）
.review-card {
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
}

// 订单信息头部
.order-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f9fafb;
  
  .order-basic {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .order-no {
    color: $gray;
    font-size: 14px;
    
    .no-text {
      color: $gray-dark;
      margin-left: 4px;
    }
  }
  
  .order-date {
    color: $gray;
    font-size: 14px;
  }
  
  .order-status {
    .status-text {
      display: inline-block;
      padding: 4px 8px;
      background-color: rgba(72, 187, 120, 0.1);
      color: #48bb78;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
  }
}

// 分隔线
.divider {
  height: 1px;
  background-color: $gray-light;
}

// 商品信息
.product-info {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
  border-bottom: 1px solid $gray-light;
  
  .product-img {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #f9f9f9;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  
  .product-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .product-name {
      font-size: 16px;
      color: $gray-dark;
      font-weight: 500;
    }
    
    .product-sku {
      font-size: 14px;
      color: $gray;
    }
    
    .product-price {
      font-size: 16px;
      color: #f56c6c;
      font-weight: 500;
      margin-top: 8px;
    }
  }
}

// 评价表单容器
.review-form-container {
  padding: 20px;
}

// 评价区块
.review-section {
  margin-bottom: 30px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $gray-dark;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid $gray-light;
  }
}

// 评分项样式
.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  .rating-label {
    width: 100px;
    font-size: 14px;
    color: $gray-dark;
    flex-shrink: 0;
  }
  
  .rating-stars {
    display: flex;
    gap: 8px;
    margin-right: 16px;
    
    i {
      font-size: 24px;
      color: $gray-light;
      cursor: pointer;
      transition: color 0.2s;
      
      &.active {
        color: $primary; // 橙色作为评分主色
      }
      
      &.hover {
        color: $primary;
        opacity: 0.8;
      }
    }
  }
  
  .rating-text {
    font-size: 14px;
    color: $gray;
  }
}

// 评分网格布局
.rating-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

// 总体评分特殊样式
.overall-rating {
  padding-bottom: 16px;
  border-bottom: 1px dashed $gray-light;
}

// 评价文本框
.review-textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px 16px;
  border: 1px solid $gray-light;
  border-radius: 6px;
  resize: vertical;
  font-size: 14px;
  color: $gray-dark;
  line-height: 1.6;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: $gray-light;
  }
}

// 字符计数
.char-count {
  text-align: right;
  font-size: 12px;
  color: $gray;
  margin-top: 8px;
  
  &.warning {
    color: #f59e0b;
  }
  
  &.error {
    color: #f56c6c;
  }
}

// 图片上传区域
.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

// 上传按钮
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 2px dashed $gray-light;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f9fafb;
  
  &:hover {
    border-color: $primary;
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  .upload-icon {
    font-size: 24px;
    color: $gray;
    margin-bottom: 8px;
  }
  
  .upload-text {
    font-size: 14px;
    color: $gray;
  }
}

// 上传提示
.upload-tips {
  font-size: 12px;
  color: $gray;
  margin-top: -8px;
  margin-bottom: 16px;
}

// 预览容器
.preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

// 预览项
.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  
  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .delete-img {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }
  }
}

// 操作按钮
.review-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid $gray-light;
}

// 取消按钮
.btn-cancel {
  padding: 10px 24px;
  background-color: white;
  color: $gray-dark;
  border: 1px solid $gray-light;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: $gray-light;
  }
}

// 提交按钮
.btn-submit {
  padding: 10px 24px;
  background-color: $primary;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: darken($primary, 10%);
  }
  
  &:disabled {
    background-color: $gray-light;
    cursor: not-allowed;
  }
}

// 评价示例
.review-examples {
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  
  .examples-title {
    font-size: 16px;
    font-weight: 600;
    color: $gray-dark;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid $gray-light;
  }
  
  .example-card {
    padding: 16px;
    border: 1px solid $gray-light;
    border-radius: 6px;
    
    .example-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      
      .example-rating {
        color: $primary;
        
        i {
          margin-right: 4px;
          
          &.active {
            color: $primary;
          }
        }
      }
      
      .example-date {
        font-size: 12px;
        color: $gray;
      }
    }
    
    .example-content {
      font-size: 14px;
      color: $gray-dark;
      line-height: 1.6;
    }
  }
}

// 成功弹窗
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 16px;
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    padding: 30px 20px;
    text-align: center;
    
    .success-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
      background-color: rgba(72, 187, 120, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 32px;
        color: #48bb78;
      }
    }
    
    .success-title {
      font-size: 18px;
      font-weight: 600;
      color: $gray-dark;
      margin-bottom: 10px;
    }
    
    .success-message {
      font-size: 14px;
      color: $gray;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    
    .btn-confirm {
      width: 100%;
      padding: 10px 0;
      background-color: $primary;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: darken($primary, 10%);
      }
    }
  }
}

// 移动端响应式适配
@media (max-width: 768px) {
  .container {
    padding: 20px 12px;
  }
  
  .page-title {
    font-size: 20px;
    margin-bottom: 16px;
  }
  
  .order-info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
  }
  
  .product-info {
    padding: 16px;
  }
  
  .product-img {
    width: 80px;
    height: 80px;
  }
  
  .rating-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    .rating-label {
      width: auto;
    }
  }
  
  .rating-items-grid {
    grid-template-columns: 1fr;
  }
  
  .review-form-container {
    padding: 16px;
  }
  
  .review-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-submit {
    width: 100%;
  }
  
  .upload-btn, .preview-item {
    width: 80px;
    height: 80px;
  }
}
</style>
