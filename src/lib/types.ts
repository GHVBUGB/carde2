// 用户信息类型
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  title?: 'شريك النمو الرئيسي' | 'مستشار النمو الذهبي' | 'مسؤول الخدمة خمس نجوم' | 'مسؤول الملاحة التعليمية';
  students_served?: number;
  rating?: number;
  phone?: string;
  is_admin?: boolean;
  // 新增业务能力字段
  teacher_screening?: boolean;    // 外教筛选
  feedback_ability?: boolean;     // 学情反馈
  planning_ability?: boolean;     // 计划制定
  resource_sharing?: boolean;     // 学习资源分享
  created_at?: string;
  updated_at?: string;
}

// 布局配置类型
export interface LayoutModule {
  id: string;
  module_name: string;
  x_position: number;
  y_position: number;
  z_index: number;
  is_locked: boolean;
  created_at?: string;
}

// 使用统计类型
export interface UsageStats {
  id: string;
  user_id: string;
  action_type: 'api_call' | 'download' | 'login' | 'register' | 'edit_profile' | 'remove_bg_api' | 'avatar_upload' | 'export';
  details?: Record<string, any>;
  created_at: string;
}

// 验证码类型
export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

// 认证相关类型
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  name: string;
  verification_code?: string;
}

// 名片编辑器类型
export interface CardData {
  user: User;
  layout: LayoutModule[];
  background_image?: string;
}

export interface CardExportOptions {
  format: 'png' | 'jpg' | 'svg';
  quality: number;
  width: number;
  height: number;
}

// 拖拽相关类型
export interface DragPosition {
  x: number;
  y: number;
  z: number;
}

export interface DragConstraints {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 管理员统计数据类型
export interface AdminStats {
  total_users: number;
  active_users: number;
  total_downloads: number;
  api_calls_today: number;
  popular_titles: Array<{
    title: string;
    count: number;
  }>;
  usage_by_day: Array<{
    date: string;
    count: number;
  }>;
}

// 错误类型
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

// 表单验证类型
export interface FormErrors {
  [key: string]: string;
}

// 文件上传类型
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
}

// Supabase 数据库表类型
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      layout_config: {
        Row: LayoutModule;
        Insert: Omit<LayoutModule, 'id' | 'created_at'>;
        Update: Partial<Omit<LayoutModule, 'id' | 'created_at'>>;
      };
      usage_stats: {
        Row: UsageStats;
        Insert: Omit<UsageStats, 'id' | 'created_at'>;
        Update: Partial<Omit<UsageStats, 'id' | 'created_at'>>;
      };
      verification_codes: {
        Row: VerificationCode;
        Insert: Omit<VerificationCode, 'id' | 'created_at'>;
        Update: Partial<Omit<VerificationCode, 'id' | 'created_at'>>;
      };
    };
  };
}
