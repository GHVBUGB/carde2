import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types'

// 客户端 Supabase 实例
export const supabase = createClientComponentClient<Database>()

// 认证相关函数
export const auth = {
  // 注册用户
  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    return { data, error }
  },

  // 登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 更新用户信息
  async updateUser(updates: any) {
    const { data, error } = await supabase.auth.updateUser(updates)
    return { data, error }
  },

  // 重置密码
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },
}

// 用户数据操作
export const userService = {
  // 获取用户资料
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // 更新用户资料
  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // 创建用户资料
  async createProfile(profile: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  },

  // 获取所有用户（管理员）
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },
}

// 布局配置操作
export const layoutService = {
  // 获取布局配置
  async getLayoutConfig() {
    const { data, error } = await supabase
      .from('layout_config')
      .select('*')
      .order('z_index', { ascending: true })
    return { data, error }
  },

  // 更新布局配置
  async updateLayoutConfig(moduleId: string, updates: Partial<Database['public']['Tables']['layout_config']['Update']>) {
    const { data, error } = await supabase
      .from('layout_config')
      .update(updates)
      .eq('id', moduleId)
      .select()
      .single()
    return { data, error }
  },

  // 批量更新布局配置
  async batchUpdateLayout(layouts: Array<{ id: string; updates: Partial<Database['public']['Tables']['layout_config']['Update']> }>) {
    const promises = layouts.map(({ id, updates }) =>
      supabase
        .from('layout_config')
        .update(updates)
        .eq('id', id)
    )
    
    const results = await Promise.all(promises)
    const errors = results.filter(result => result.error)
    
    return {
      success: errors.length === 0,
      errors,
    }
  },

  // 重置布局配置
  async resetLayoutConfig() {
    const defaultLayout = [
      { module_name: 'avatar', x_position: 50, y_position: 50, z_index: 1, is_locked: true },
      { module_name: 'name', x_position: 200, y_position: 50, z_index: 2, is_locked: true },
      { module_name: 'title', x_position: 200, y_position: 100, z_index: 3, is_locked: true },
      { module_name: 'stats', x_position: 50, y_position: 150, z_index: 4, is_locked: true },
      { module_name: 'contact', x_position: 50, y_position: 250, z_index: 5, is_locked: true },
    ]

    const { error } = await supabase
      .from('layout_config')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有记录

    if (error) return { error }

    const { data, error: insertError } = await supabase
      .from('layout_config')
      .insert(defaultLayout)
      .select()

    return { data, error: insertError }
  },
}

// 使用统计操作
export const statsService = {
  // 记录用户行为
  async logUserAction(userId: string, actionType: string, details?: any) {
    const { data, error } = await supabase
      .from('usage_stats')
      .insert({
        user_id: userId,
        action_type: actionType,
        details,
      })
      .select()
      .single()
    return { data, error }
  },

  // 获取用户统计
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 获取全局统计（管理员）
  async getGlobalStats() {
    // 总用户数
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // 今日活跃用户
    const today = new Date().toISOString().split('T')[0]
    const { count: activeUsers } = await supabase
      .from('usage_stats')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)
      .eq('action_type', 'login')

    // 下载统计
    const { count: totalDownloads } = await supabase
      .from('usage_stats')
      .select('*', { count: 'exact', head: true })
      .eq('action_type', 'download')

    // API调用统计
    const { count: apiCalls } = await supabase
      .from('usage_stats')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)
      .eq('action_type', 'api_call')

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalDownloads: totalDownloads || 0,
      apiCalls: apiCalls || 0,
    }
  },

  // 获取热门头衔统计
  async getPopularTitles() {
    const { data, error } = await supabase
      .from('users')
      .select('title')
      .not('title', 'is', null)

    if (error || !data) return { data: [], error }

    const titleCounts = data.reduce((acc, user) => {
      const title = user.title!
      acc[title] = (acc[title] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const popularTitles = Object.entries(titleCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)

    return { data: popularTitles, error: null }
  },
}

// 文件存储操作
export const storageService = {
  // 上传头像
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (error) return { data: null, error }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return { data: { path: data.path, url: publicUrl }, error: null }
  },

  // 删除头像
  async deleteAvatar(path: string) {
    const { data, error } = await supabase.storage
      .from('avatars')
      .remove([path])
    return { data, error }
  },

  // 获取头像URL
  getAvatarUrl(path: string) {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)
    return data.publicUrl
  },
}
