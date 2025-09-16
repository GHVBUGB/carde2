'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// 管理员固定密码
const ADMIN_PASSWORD = 'GhJ2537652940'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 验证管理员固定密码
      if (password !== ADMIN_PASSWORD) {
        throw new Error('管理员密码错误，请检查后重试')
      }

      // 设置管理员会话信息
      localStorage.setItem('admin_logged_in', 'true')
      localStorage.setItem('admin_email', 'admin@51talk.com')
      localStorage.setItem('admin_login_time', new Date().toISOString())

      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 跳转到管理面板
      router.push('/admin/dashboard')

    } catch (error: any) {
      console.error('Admin login failed:', error)
      setError(error.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">管理员登录</h1>
          <p className="text-gray-600 mt-2">51Talk名片平台管理中心</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>管理员登录</CardTitle>
            <CardDescription>
              请输入管理员密码进入管理面板
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">管理员密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入管理员密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
                <p className="text-sm text-gray-500">
                  输入正确的管理员密码即可进入管理面板
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>登录中...</span>
                  </div>
                ) : (
                  '登录管理面板'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>仅限授权管理员访问</p>
              <p className="mt-1">无需账号，仅需密码即可登录</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a href="/login" className="text-blue-600 hover:text-blue-500 transition-colors">
                  ← 返回用户登录
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安全提示 */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            安全登录 · 数据加密传输
          </div>
        </div>
      </div>
    </div>
  )
}
