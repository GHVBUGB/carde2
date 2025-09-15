import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '../types'

// 服务端组件客户端
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// API路由客户端
export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}

// 管理端客户端（使用服务端密钥）
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  // Use the service role key for privileged server-side operations only.
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

// 邮箱验证相关服务
export const emailVerificationService = {
  // 生成验证码
  async generateCode(email: string): Promise<string> {
    const code = Math.random().toString().slice(2, 8)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期

    // 检查环境变量是否存在
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase环境变量未配置，请检查.env.local文件')
    }

    const supabase = createAdminClient()
    
    // 删除之前的验证码
    const { error: delError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
    
    if (delError) {
      console.error('删除旧验证码失败:', delError)
      throw new Error('数据库操作失败')
    }

    // 插入新验证码
    const { error } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      })

    if (error) {
      console.error('插入验证码失败:', error)
      throw new Error('数据库操作失败')
    }

    return code
  },

  // 验证码校验
  async verifyCode(email: string, code: string): Promise<boolean> {
    // 检查环境变量是否存在
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase环境变量未配置，请检查.env.local文件')
    }

    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return false
    }

    // 标记验证码为已使用
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data.id)

    return true
  },

  // 清理过期验证码
  async cleanupExpiredCodes(): Promise<number> {
    const supabase = createAdminClient()
    
    const { count } = await supabase
      .from('verification_codes')
      .delete()
      .or(`expires_at.lt.${new Date().toISOString()},used.eq.true`)

    return count || 0
  },
}

// 统计服务
export const adminStatsService = {
  // 获取总体统计
  async getOverviewStats() {
    const supabase = createAdminClient()
    
    // 并发查询所有统计数据
    const [
      { count: totalUsers },
      { count: activeUsersToday },
      { count: totalDownloads },
      { count: apiCallsToday },
    ] = await Promise.all([
      // 总用户数
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true }),
      
      // 今日活跃用户
      supabase
        .from('usage_stats')
        .select('user_id', { count: 'exact', head: true })
        .eq('action_type', 'login')
        .gte('created_at', new Date().toISOString().split('T')[0]),
      
      // 总下载数
      supabase
        .from('usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'download'),
      
      // 今日API调用数
      supabase
        .from('usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'api_call')
        .gte('created_at', new Date().toISOString().split('T')[0]),
    ])

    return {
      totalUsers: totalUsers || 0,
      activeUsersToday: activeUsersToday || 0,
      totalDownloads: totalDownloads || 0,
      apiCallsToday: apiCallsToday || 0,
    }
  },

  // 获取用户注册趋势
  async getUserRegistrationTrend(days: number = 30) {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // 按日期分组统计
    const dailyStats = data.reduce((acc, user) => {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count,
    }))
  },

  // 获取热门头衔统计
  async getPopularTitles() {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('title')
      .not('title', 'is', null)

    if (error) throw error

    const titleCounts = data.reduce((acc, user) => {
      const title = user.title!
      acc[title] = (acc[title] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(titleCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
  },

  // 获取每日活动统计
  async getDailyActivityStats(days: number = 30) {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('usage_stats')
      .select('created_at, action_type')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    if (error) throw error

    // 按日期和行为类型分组
    const dailyStats = data.reduce((acc, stat) => {
      const date = new Date(stat.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {}
      }
      acc[date][stat.action_type] = (acc[date][stat.action_type] || 0) + 1
      return acc
    }, {} as Record<string, Record<string, number>>)

    return Object.entries(dailyStats).map(([date, actions]) => ({
      date,
      ...actions,
    }))
  },
}

// 用户管理服务
export const userManagementService = {
  // 获取用户列表（分页）
  async getUserList(page: number = 1, limit: number = 20, search?: string) {
    const supabase = createAdminClient()
    
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  // 更新用户管理员状态
  async updateUserAdminStatus(userId: string, isAdmin: boolean) {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 获取用户详细信息和统计
  async getUserDetails(userId: string) {
    const supabase = createAdminClient()
    
    // 并发查询用户信息和统计
    const [
      { data: user, error: userError },
      { data: stats, error: statsError },
    ] = await Promise.all([
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),
      
      supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (userError) throw userError

    return {
      user,
      stats: stats || [],
      totalActions: stats?.length || 0,
      lastAction: stats?.[0]?.created_at || null,
    }
  },
}

// 布局管理服务
export const layoutManagementService = {
  // 获取当前布局配置
  async getCurrentLayout() {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('layout_config')
      .select('*')
      .order('z_index', { ascending: true })

    if (error) throw error
    return data || []
  },

  // 批量更新布局
  async batchUpdateLayout(updates: Array<{
    id: string
    x_position?: number
    y_position?: number
    z_index?: number
    is_locked?: boolean
  }>) {
    const supabase = createAdminClient()
    
    const promises = updates.map(({ id, ...updateData }) =>
      supabase
        .from('layout_config')
        .update(updateData)
        .eq('id', id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(result => result.error)

    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} layout items`)
    }

    return true
  },

  // 重置布局到默认状态
  async resetToDefaultLayout() {
    const supabase = createAdminClient()
    
    const defaultLayout = [
      { module_name: 'avatar', x_position: 50, y_position: 50, z_index: 1, is_locked: true },
      { module_name: 'name', x_position: 200, y_position: 50, z_index: 2, is_locked: true },
      { module_name: 'title', x_position: 200, y_position: 100, z_index: 3, is_locked: true },
      { module_name: 'stats', x_position: 50, y_position: 150, z_index: 4, is_locked: true },
      { module_name: 'abilities', x_position: 50, y_position: 200, z_index: 5, is_locked: true },
      { module_name: 'contact', x_position: 50, y_position: 250, z_index: 6, is_locked: true },
    ]

    // 删除现有配置
    const { error: deleteError } = await supabase
      .from('layout_config')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) throw deleteError

    // 插入默认配置
    const { data, error: insertError } = await supabase
      .from('layout_config')
      .insert(defaultLayout)
      .select()

    if (insertError) throw insertError
    return data
  },
}
