'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { is51TalkEmail, isValidEmail } from '@/lib/utils'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError('所有字段都不能为空')
      return
    }

    if (!isValidEmail(formData.email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (!is51TalkEmail(formData.email)) {
      setError('只能重置51Talk邮箱密码')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('密码至少需要8个字符')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '密码重置失败')
      }

      setSuccess('密码重置成功！您现在可以使用新密码登录了')
      setFormData({ email: '', newPassword: '', confirmPassword: '' })

    } catch (err) {
      setError(err instanceof Error ? err.message : '密码重置失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-dark">
            重置密码
          </CardTitle>
          <CardDescription className="text-brand-gray">
            为您的51Talk账户设置新密码
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                51Talk邮箱 *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your-name@51talk.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-brand-dark mb-2">
                新密码 *
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="请输入新密码（至少8位）"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                确认新密码 *
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={loading}
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? '重置中...' : '重置密码'}
            </Button>
          </form>

          <div className="text-center pt-4">
            <Link 
              href="/login"
              className="text-brand-blue hover:text-brand-purple transition-colors text-sm"
            >
              返回登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


