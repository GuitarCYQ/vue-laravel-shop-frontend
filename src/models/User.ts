// src/types/User.ts
/**
 * 用户相关类型定义
 */

// 用户基础信息
export interface UserInfo {
  id: number;           // 用户ID
  name: string;         // 用户名
  email: string;        // 邮箱
  avatar: string;       // 头像URL
  phone?: string;       // 手机号
  createTime: string;   // 创建时间
  lastLoginTime: string;// 最后登录时间
  role: UserRole;       // 用户角色
}

// 用户角色
export enum UserRole {
  NORMAL = 'normal',    // 普通用户
  VIP = 'vip',          // VIP用户
  ADMIN = 'admin',      // 管理员
}

// 用户登录请求
export interface LoginRequest {
  email: string;        // 邮箱
  password: string;     // 密码
}

// 用户登录响应
export interface LoginResponse {
  token: string;        // 认证令牌
  userInfo: UserInfo;   // 用户信息
}

// 用户注册请求
export interface RegisterRequest {
  email: string;        // 邮箱
  password: string;     // 密码
  name: string;         // 用户名
}

// 更新用户信息请求
export interface UpdateUserRequest {
  name?: string;        // 用户名
  avatar?: string;      // 头像URL
  phone?: string;       // 手机号
}