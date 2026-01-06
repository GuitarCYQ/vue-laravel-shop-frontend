<!-- 用户中心 -->
<template>
  <div class="user-center">
    <!-- 导航栏 -->
    <Header>
      <template #nav>
        <nav class="main-nav hidden md:flex">
          <ul class="nav-list">
            <li class="nav-item"><a href="/">首页</a></li>
            <li class="nav-item"><a href="/category">商品分类</a></li>
            <li class="nav-item"><a href="/cart">购物车</a></li>
          </ul>
        </nav>
      </template>

      <template #icon>
        <div class="nav-actions">
          <button class="action-btn cart-btn" @click="$router.push('/cart')">
            <i class="icon-cart"></i>
            <span class="cart-count">3</span>
          </button>
        </div>
      </template>
    </Header>

    <main class="container">
      <div class="user-content">
        <!-- 用户信息 -->
        <el-card class="user-profile-card">
          <div class="user-profile">
            <el-avatar :size="80" class="avatar">
              <img :src="user?.avatar || defaultAvatar" alt="用户头像" />
            </el-avatar>
            <div class="user-info">
              <h2 class="username">{{ user?.name || "未登录" }}</h2>
              <p class="user-email">{{ user?.email || "未登录" }}</p>
            </div>
            <el-button
              type="primary"
              class="edit-profile"
              @click="openEditModal"
            >
              编辑资料
            </el-button>
          </div>
        </el-card>

        <!-- 功能菜单（使用 Element 栅格系统） -->
        <el-card class="user-menu-card" style="margin-top: 20px">
          <el-row :gutter="16">
            <el-col
              :span="8"
              :sm="6"
              :md="4"
              v-for="(item, idx) in menuItems"
              :key="idx"
            >
              <el-card
                class="menu-item-card"
                @click="item.isLogout ? logout() : $router.push(item.path)"
              >
                <div class="menu-icon">{{ item.icon }}</div>
                <div class="menu-text">{{ item.text }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>

        <!-- 订单列表 -->
        <el-card class="orders-card" style="margin-top: 20px">
          <div slot="header" class="section-title">最近订单</div>

          <el-table :data="recentOrders" border style="width: 100%">
            <el-table-column prop="orderNo" label="订单号"></el-table-column>
            <el-table-column prop="date" label="下单时间"></el-table-column>
            <el-table-column label="商品">
              <template #default="scope">
                <div
                  class="product-item"
                  v-for="p in scope.row.products"
                  :key="p.id"
                >
                  <img :src="p.imgUrl" alt="" class="product-img" />
                  <span class="product-name">{{ p.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="合计">
              <template #default="scope">¥{{ scope.row.totalPrice }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === '待支付' ? 'warning' : 'success'"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  size="small"
                  :type="scope.row.status === '待支付' ? 'primary' : 'default'"
                >
                  {{ scope.row.actionText }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-link
            href="/user/orders"
            class="view-all"
            style="display: block; text-align: center; margin-top: 10px"
          >
            查看全部订单 →
          </el-link>
        </el-card>

        <!-- <router-view></router-view> -->
      </div>
    </main>

    <!-- 编辑资料弹窗（Element Plus Dialog） -->
    <el-dialog title="编辑个人资料" v-model="isEditModalShow" width="500px">
      <div v-loading="loading" element-loading-text="保存中">
        <el-form :model="editForm" ref="editFormRef" label-width="80px">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="editForm.name"></el-input>
          </el-form-item>
          <!-- <el-form-item label="邮箱" prop="email">
		  <el-input v-model="editForm.email" disabled></el-input>
		</el-form-item> -->
          <el-form-item label="头像">
            <!-- 实际项目中替换为上传接口 -->
            <el-upload
              :http-request="customAvatarUpload"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :auto-upload="true"
            >
              <el-avatar :size="100" class="upload-avatar">
                <img
                  v-if="editForm.avatar"
                  :src="editForm.avatar"
                  alt="用户头像"
                />
                <i v-else>上传</i>
              </el-avatar>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { ElMessage, ElLoading } from "element-plus";
import { apiUpdateAvatar, apiUpdateUserInfo } from "@/services/userService";
import Header from "@/components/Layouts/_header.vue";
import Footer from "@/components/Layouts/_footer.vue";

const router = useRouter();

// 初始化 authStore
const authStore = useAuthStore();
// 用户信息
const user = computed(() => authStore.user);
// 默认头像
const defaultAvatar = "https://picsum.photos/id/237/80/80";

// 菜单数据
const menuItems = [
  { path: "/orders", icon: "📦", text: "我的订单" },
  { path: "/user/addresses", icon: "🏠", text: "收货地址" },
  { path: "/user/coupons", icon: "🎫", text: "我的优惠券" },
  { path: "/user/favorites", icon: "❤️", text: "我的收藏" },
  { path: "/user/settings", icon: "⚙️", text: "设置" },
  { path: "/#", icon: "🚪", text: "退出登录", isLogout: true },
];

// 最近订单
const recentOrders = reactive([
  {
    orderNo: "20250719123456",
    date: "2025-07-19 10:24",
    status: "待支付",
    statusClass: "status-pending",
    products: [
      {
        imgUrl: "https://picsum.photos/id/96/80/80",
        name: "夏季纯棉短袖T恤 宽松百搭",
        price: 59.9,
        quantity: 2,
      },
    ],
    totalPrice: 119.8,
    actionText: "去支付",
    actionClass: "action-primary",
  },
  {
    orderNo: "20250718987654",
    date: "2025-07-18 15:42",
    status: "已发货",
    statusClass: "status-shipped",
    products: [
      {
        imgUrl: "https://picsum.photos/id/97/80/80",
        name: "无线蓝牙耳机 主动降噪",
        price: 299,
        quantity: 1,
      },
    ],
    totalPrice: 299,
    actionText: "查看物流",
    actionClass: "action-default",
  },
]);

// 编辑个人资料
const isEditModalShow = ref(false);
// 原始头像
const originalAvatar = ref("");
// 临时图片文件（未上传到后端
const tempAvatarFile = ref<File | null>(null);

const editFormRef = ref(null);
const editForm = ref({
  name: "",
  email: "",
  avatar: "",
});
const loading = ref(false);

// 打开弹窗
const openEditModal = () => {
  // getMyInfo()
  if (user.value) {
    editForm.value.name = user.value.name || "";
    editForm.value.avatar = user.value.avatar || "";
  }
  isEditModalShow.value = true;
};

// 头像上传前的校验
const beforeAvatarUpload = (file: any) => {
  const isJPG = file.type === "image/jpeg";
  const isPNG = file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG && !isPNG) {
    ElMessage.error("上传头像图片只能是 JPG/PNG 格式!");
    return false;
  }

  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
    return false;
  }

  return true;
};

// 自定义上传方法
const customAvatarUpload = async (options: any) => {
  const file = options.file;
  // 生成浏览器本地预览url
  const reader = new FileReader();
  reader.onload = (e) => {
    editForm.value.avatar = e.target?.result as string; //显示本地预览
  };
  reader.readAsDataURL(file);
  tempAvatarFile.value = file;
  options.onSuccess();
};

// 点击取消：恢复原始状态
const handleCancel = () => {
  editForm.value.avatar = originalAvatar.value; // 恢复原始头像
  tempAvatarFile.value = null; // 清空临时文件
  isEditModalShow.value = false;
};

// 保存修改
const handleUpdateProfile = async () => {
  try {
    loading.value = true;
    // 1.若有新图片，先上传获取URL
    let newAvatarUrl = editForm.value.avatar;
    if (tempAvatarFile.value) {
      // 创建FormData上传图片
      const formData = new FormData();
      formData.append("image", tempAvatarFile.value); // 添加文件
      formData.append("type", "avatar"); // 添加类型参数
      const { data } = await apiUpdateAvatar(formData);
      console.log(data, "图片");
      newAvatarUrl = data.id;
    }

    // 提交修改资料
    await apiUpdateUserInfo({
      name: editForm.value.name,
      avatar_image_id: Number(newAvatarUrl), // 这是上传后从后端获取的URL
    });

    // 更新本地状态
    authStore.setUser({
      ...authStore.user,
      name: editForm.value.name,
      avatar: editForm.value.avatar,
    });
    isEditModalShow.value = false;
    ElMessage.success("资料更新成功");
  } catch (error: any) {
    ElMessage.error(error.response.data.message);
  } finally {
    loading.value = false;
  }
};

// 退出登录
const logout = () => {
  authStore.logout();
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/common/common.scss";
.user-center {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

main {
  padding: 30px 0;

  .user-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }

  // 用户信息卡片
  .user-profile-card {
    .user-profile {
      display: flex;
      align-items: center;
      padding: 20px;

      .avatar {
        margin-right: 20px;
      }

      .user-info {
        flex: 1;
        .username {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .user-email {
          color: #666;
          font-size: 14px;
        }
      }

      .edit-profile {
        margin-left: auto;
      }
    }
  }

  // 菜单卡片
  .user-menu-card {
    border: none;
    background-color: transparent;
    box-shadow: none;
  }

  .menu-item-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 8px;
    height: 120px;
    border-radius: 12px;
    border: 1px solid #ebeef5;
    background-color: white;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .menu-item-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #dcdfe6;
  }

  .menu-item-card:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .menu-icon {
    font-size: 32px;
    margin-bottom: 8px;
    color: #303133;
  }

  .menu-text {
    font-size: 14px;
    color: #606266;
    text-align: center;
  }

  /* 退出登录项的特殊样式 */
  .menu-item-card:last-child .menu-icon {
    color: #f56c6c;
  }

  .menu-item-card:last-child .menu-text {
    color: #f56c6c;
  }

  // 订单表格
  .orders-card {
    .product-item {
      display: flex;
      align-items: center;
      gap: 8px;
      .product-img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;
      }
      .product-name {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }
    }
  }
}
Header {
  margin-bottom: 10px;
}
Footer {
  margin-top: 50px;
}
</style>
