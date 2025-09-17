import { createAdminClient } from '@/lib/supabase/server'

export interface ApiLogEntry {
  user_id?: string
  action_type: 'download' | 'remove_background' | 'login' | 'register' | 'card_create' | 'api_call'
  endpoint?: string
  method?: string
  status_code?: number
  response_time?: number
  details?: any
  ip_address?: string
  user_agent?: string
}

export class ApiLogger {
  private static async getSupabase() {
    // 使用 service role，确保在 RLS 存在时也能写入日志
    return createAdminClient()
  }

  /**
   * 记录API调用
   */
  static async log(entry: ApiLogEntry): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()

      // 尝试插入到api_logs表
      const { error } = await supabase
        .from('api_logs')
        .insert({
          user_id: entry.user_id,
          action_type: entry.action_type,
          endpoint: entry.endpoint,
          method: entry.method,
          status_code: entry.status_code,
          response_time: entry.response_time,
          request_body: entry.details || {},
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Failed to log API call:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('API logger error:', error)
      return false
    }
  }

  /**
   * 记录用户下载
   */
  static async logDownload(userId?: string, details?: any, request?: Request): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      user_id: userId,
      action_type: 'download',
      endpoint: '/api/export',
      method: 'POST',
      status_code: 200,
      details: {
        format: details?.format || 'png',
        method: details?.method || 'dom',
        timestamp: new Date().toISOString(),
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    })
  }

  /**
   * 记录抠图API调用
   */
  static async logRemoveBackground(userId?: string, details?: any, request?: Request): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      user_id: userId,
      action_type: 'remove_background',
      endpoint: '/api/remove-background',
      method: 'POST',
      status_code: details?.success !== false ? 200 : 500,
      response_time: details?.processingTime,
      details: {
        image_size: details?.imageSize,
        processing_time: details?.processingTime,
        success: details?.success !== false,
        timestamp: new Date().toISOString(),
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    })
  }

  /**
   * 记录用户登录
   */
  static async logLogin(userId: string, details?: any, request?: Request): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      user_id: userId,
      action_type: 'login',
      endpoint: '/api/auth/login',
      method: 'POST',
      status_code: 200,
      details: {
        login_method: details?.method || 'email',
        timestamp: new Date().toISOString(),
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    })
  }

  /**
   * 记录用户注册
   */
  static async logRegister(userId: string, details?: any, request?: Request): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      user_id: userId,
      action_type: 'register',
      endpoint: '/api/auth/register',
      method: 'POST',
      status_code: 200,
      details: {
        registration_method: details?.method || 'email',
        timestamp: new Date().toISOString(),
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    })
  }

  /**
   * 记录名片创建
   */
  static async logCardCreate(userId?: string, details?: any, request?: Request): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      user_id: userId,
      action_type: 'card_create',
      endpoint: '/api/card/create',
      method: 'POST',
      status_code: 200,
      details: {
        template_used: details?.template,
        customization_level: details?.customizations || 'basic',
        timestamp: new Date().toISOString(),
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    })
  }

  /**
   * 记录通用API调用
   */
  static async logApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime?: number,
    userId?: string,
    details?: any,
    request?: Request
  ): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      user_id: userId,
      action_type: 'api_call',
      endpoint: endpoint,
      method: method,
      status_code: statusCode,
      response_time: responseTime,
      details: {
        timestamp: new Date().toISOString(),
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    })
  }

  /**
   * 获取今日API调用统计
   */
  static async getTodayStats(): Promise<{
    downloads: number
    removeBg: number
    logins: number
    registers: number
    cardCreates: number
    total: number
  }> {
    try {
      const supabase = await this.getSupabase()
      
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

      const { data: logs, error } = await supabase
        .from('api_logs')
        .select('action_type')
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd)

      if (error) throw error

      const stats = {
        downloads: 0,
        removeBg: 0,
        logins: 0,
        registers: 0,
        cardCreates: 0,
        total: 0
      }

      if (logs) {
        stats.total = logs.length
        stats.downloads = logs.filter(log => log.action_type === 'download').length
        stats.removeBg = logs.filter(log => log.action_type === 'remove_background').length
        stats.logins = logs.filter(log => log.action_type === 'login').length
        stats.registers = logs.filter(log => log.action_type === 'register').length
        stats.cardCreates = logs.filter(log => log.action_type === 'card_create').length
      }

      return stats

    } catch (error) {
      console.error('Failed to get today stats:', error)
      return {
        downloads: 0,
        removeBg: 0,
        logins: 0,
        registers: 0,
        cardCreates: 0,
        total: 0
      }
    }
  }
}
