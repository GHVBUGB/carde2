// Supabase 数据库类型定义
// 这个文件专门用于Supabase客户端的类型定义

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  title?: string;
  students_served?: number;
  rating?: number;
  phone?: string;
  is_admin?: boolean;
  teacher_screening?: boolean;
  feedback_ability?: boolean;
  planning_ability?: boolean;
  resource_sharing?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LayoutModule {
  id: string;
  module_name: string;
  x_position: number;
  y_position: number;
  z_index: number;
  is_locked: boolean;
  created_at?: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  action_type: 'api_call' | 'download' | 'login' | 'register' | 'edit_profile' | 'remove_bg_api' | 'avatar_upload' | 'export';
  details?: Record<string, any>;
  created_at: string;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

// Supabase 专用数据库类型
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
