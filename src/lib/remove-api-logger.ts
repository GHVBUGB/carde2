import { createAdminClient } from './supabase/server'

export interface RemoveApiLogData {
  userId: string
  userEmail: string
  userName?: string
  apiProvider: 'remove_bg' | 'local_advanced' | 'local_simple'
  originalFileSize?: number
  originalFileType?: string
  processedFileSize?: number
  processingTime?: number
  success: boolean
  errorMessage?: string
  errorCode?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export class RemoveApiLogger {
  private static async getSupabase() {
    return createAdminClient()
  }

  /**
   * 记录Remove API调用
   */
  static async logRemoveApiCall(data: RemoveApiLogData, request?: Request): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // 获取请求信息
      const ipAddress = request?.headers.get('x-forwarded-for') || 
                       request?.headers.get('x-real-ip') || 
                       'unknown'
      const userAgent = request?.headers.get('user-agent') || 'unknown'
      
      // 获取用户当日和当月使用次数
      const dailyCount = await this.getUserDailyUsageCount(data.userId)
      const monthlyCount = await this.getUserMonthlyUsageCount(data.userId)
      
      // 插入记录
      const { error } = await supabase
        .from('remove_api_logs')
        .insert({
          user_id: data.userId,
          user_email: data.userEmail,
          user_name: data.userName,
          api_provider: data.apiProvider,
          original_file_size: data.originalFileSize,
          original_file_type: data.originalFileType,
          processed_file_size: data.processedFileSize,
          processing_time: data.processingTime,
          success: data.success,
          error_message: data.errorMessage,
          error_code: data.errorCode,
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: data.sessionId,
          daily_usage_count: dailyCount + 1,
          monthly_usage_count: monthlyCount + 1
        })

      if (error) {
        console.error('Failed to log remove API call:', error)
      } else {
        console.log(`✅ Remove API调用已记录: ${data.userEmail} - ${data.apiProvider} - ${data.success ? '成功' : '失败'}`)
      }
    } catch (error) {
      console.error('Error logging remove API call:', error)
    }
  }

  /**
   * 获取用户当日使用次数
   */
  static async getUserDailyUsageCount(userId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase()
      const today = new Date().toISOString().split('T')[0]
      
      const { count, error } = await supabase
        .from('remove_api_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      if (error) {
        console.error('Failed to get daily usage count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error getting daily usage count:', error)
      return 0
    }
  }

  /**
   * 获取用户当月使用次数
   */
  static async getUserMonthlyUsageCount(userId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase()
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()
      
      const { count, error } = await supabase
        .from('remove_api_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd)

      if (error) {
        console.error('Failed to get monthly usage count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error getting monthly usage count:', error)
      return 0
    }
  }

  /**
   * 检查用户是否超过使用限制
   */
  static async checkUserUsageLimit(userId: string, dailyLimit: number = 5): Promise<{
    canUse: boolean
    dailyCount: number
    remaining: number
  }> {
    const dailyCount = await this.getUserDailyUsageCount(userId)
    const canUse = dailyCount < dailyLimit
    const remaining = Math.max(0, dailyLimit - dailyCount)

    return {
      canUse,
      dailyCount,
      remaining
    }
  }

  /**
   * 获取用户使用统计
   */
  static async getUserUsageStats(userId: string): Promise<{
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    removeBgCalls: number
    localAdvancedCalls: number
    localSimpleCalls: number
    avgProcessingTime: number
    totalFileSizeProcessed: number
    firstUsage: string | null
    lastUsage: string | null
  }> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('remove_api_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to get user usage stats:', error)
        return {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          removeBgCalls: 0,
          localAdvancedCalls: 0,
          localSimpleCalls: 0,
          avgProcessingTime: 0,
          totalFileSizeProcessed: 0,
          firstUsage: null,
          lastUsage: null
        }
      }

      if (!data || data.length === 0) {
        return {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          removeBgCalls: 0,
          localAdvancedCalls: 0,
          localSimpleCalls: 0,
          avgProcessingTime: 0,
          totalFileSizeProcessed: 0,
          firstUsage: null,
          lastUsage: null
        }
      }

      const totalCalls = data.length
      const successfulCalls = data.filter(log => log.success).length
      const failedCalls = data.filter(log => !log.success).length
      const removeBgCalls = data.filter(log => log.api_provider === 'remove_bg').length
      const localAdvancedCalls = data.filter(log => log.api_provider === 'local_advanced').length
      const localSimpleCalls = data.filter(log => log.api_provider === 'local_simple').length
      
      const processingTimes = data.filter(log => log.processing_time).map(log => log.processing_time)
      const avgProcessingTime = processingTimes.length > 0 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
        : 0
      
      const totalFileSizeProcessed = data
        .filter(log => log.original_file_size)
        .reduce((sum, log) => sum + log.original_file_size, 0)
      
      const firstUsage = data[data.length - 1]?.created_at || null
      const lastUsage = data[0]?.created_at || null

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        removeBgCalls,
        localAdvancedCalls,
        localSimpleCalls,
        avgProcessingTime,
        totalFileSizeProcessed,
        firstUsage,
        lastUsage
      }
    } catch (error) {
      console.error('Error getting user usage stats:', error)
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        removeBgCalls: 0,
        localAdvancedCalls: 0,
        localSimpleCalls: 0,
        avgProcessingTime: 0,
        totalFileSizeProcessed: 0,
        firstUsage: null,
        lastUsage: null
      }
    }
  }

  /**
   * 获取总体使用统计
   */
  static async getOverallUsageStats(): Promise<{
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    uniqueUsers: number
    removeBgCalls: number
    localAdvancedCalls: number
    localSimpleCalls: number
    avgProcessingTime: number
    totalFileSizeProcessed: number
  }> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('remove_api_logs')
        .select('*')

      if (error) {
        console.error('Failed to get overall usage stats:', error)
        return {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          uniqueUsers: 0,
          removeBgCalls: 0,
          localAdvancedCalls: 0,
          localSimpleCalls: 0,
          avgProcessingTime: 0,
          totalFileSizeProcessed: 0
        }
      }

      if (!data || data.length === 0) {
        return {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          uniqueUsers: 0,
          removeBgCalls: 0,
          localAdvancedCalls: 0,
          localSimpleCalls: 0,
          avgProcessingTime: 0,
          totalFileSizeProcessed: 0
        }
      }

      const totalCalls = data.length
      const successfulCalls = data.filter(log => log.success).length
      const failedCalls = data.filter(log => !log.success).length
      const uniqueUsers = new Set(data.map(log => log.user_id)).size
      const removeBgCalls = data.filter(log => log.api_provider === 'remove_bg').length
      const localAdvancedCalls = data.filter(log => log.api_provider === 'local_advanced').length
      const localSimpleCalls = data.filter(log => log.api_provider === 'local_simple').length
      
      const processingTimes = data.filter(log => log.processing_time).map(log => log.processing_time)
      const avgProcessingTime = processingTimes.length > 0 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
        : 0
      
      const totalFileSizeProcessed = data
        .filter(log => log.original_file_size)
        .reduce((sum, log) => sum + log.original_file_size, 0)

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        uniqueUsers,
        removeBgCalls,
        localAdvancedCalls,
        localSimpleCalls,
        avgProcessingTime,
        totalFileSizeProcessed
      }
    } catch (error) {
      console.error('Error getting overall usage stats:', error)
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        uniqueUsers: 0,
        removeBgCalls: 0,
        localAdvancedCalls: 0,
        localSimpleCalls: 0,
        avgProcessingTime: 0,
        totalFileSizeProcessed: 0
      }
    }
  }

  /**
   * 获取今日使用统计
   */
  static async getTodayUsageStats(): Promise<{
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    uniqueUsers: number
    removeBgCalls: number
    localAdvancedCalls: number
    localSimpleCalls: number
  }> {
    try {
      const supabase = await this.getSupabase()
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('remove_api_logs')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      if (error) {
        console.error('Failed to get today usage stats:', error)
        return {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          uniqueUsers: 0,
          removeBgCalls: 0,
          localAdvancedCalls: 0,
          localSimpleCalls: 0
        }
      }

      if (!data || data.length === 0) {
        return {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          uniqueUsers: 0,
          removeBgCalls: 0,
          localAdvancedCalls: 0,
          localSimpleCalls: 0
        }
      }

      const totalCalls = data.length
      const successfulCalls = data.filter(log => log.success).length
      const failedCalls = data.filter(log => !log.success).length
      const uniqueUsers = new Set(data.map(log => log.user_id)).size
      const removeBgCalls = data.filter(log => log.api_provider === 'remove_bg').length
      const localAdvancedCalls = data.filter(log => log.api_provider === 'local_advanced').length
      const localSimpleCalls = data.filter(log => log.api_provider === 'local_simple').length

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        uniqueUsers,
        removeBgCalls,
        localAdvancedCalls,
        localSimpleCalls
      }
    } catch (error) {
      console.error('Error getting today usage stats:', error)
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        uniqueUsers: 0,
        removeBgCalls: 0,
        localAdvancedCalls: 0,
        localSimpleCalls: 0
      }
    }
  }
}
