'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { is51TalkEmail, isValidEmail } from '@/lib/utils'

interface LoginStep {
  email: string
  password?: string
  verificationCode?: string
  showPasswordInput: boolean
  showVerificationInput: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState<LoginStep>({
    email: '',
    password: '',
    verificationCode: '',
    showPasswordInput: false,
    showVerificationInput: false,
  })

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!step.email) {
      setError('请输入邮箱')
      return
    }

    if (!isValidEmail(step.email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (!is51TalkEmail(step.email)) {
      setError('只能使用51Talk邮箱登录')
      return
    }

    setLoading(true)

    try {
      // 发送登录链接/验证码
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: step.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError('该邮箱尚未注册，请先注册账号')
          return
        }
        throw new Error(data.error || '发送失败')
      }

      setSuccess(data.message)
      setStep(prev => ({ ...prev, showVerificationInput: true }))

    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!step.password) {
      setError('请输入密码')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: step.email, 
          password: step.password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

      setSuccess('登录成功，即将跳转...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!step.verificationCode) {
      setError('请输入验证码')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step.email,
          token: step.verificationCode,
          type: 'email',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '验证失败')
      }

      setSuccess('登录成功，即将跳转...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-dark">
            欢迎回来
          </CardTitle>
          <CardDescription className="text-brand-gray">
            登录您的51Talk名片账户
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

          {!step.showVerificationInput && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                  51Talk邮箱
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-name@51talk.com"
                  value={step.email}
                  onChange={(e) => setStep(prev => ({ ...prev, email: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? '发送中...' : '发送登录链接'}
              </Button>
            </form>
          )}

          {step.showVerificationInput && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-brand-dark mb-2">
                  验证码
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="请输入邮箱中收到的验证码"
                  value={step.verificationCode}
                  onChange={(e) => setStep(prev => ({ ...prev, verificationCode: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep(prev => ({ 
                    ...prev, 
                    showVerificationInput: false,
                    verificationCode: '' 
                  }))}
                  disabled={loading}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? '验证中...' : '验证登录'}
                </Button>
              </div>
            </form>
          )}

          {!step.showVerificationInput && !step.showPasswordInput && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(prev => ({ ...prev, showPasswordInput: true }))}
                className="text-sm text-brand-primary hover:underline"
              >
                使用密码登录
              </button>
            </div>
          )}

          {step.showPasswordInput && !step.showVerificationInput && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2">
                  密码
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={step.password}
                  onChange={(e) => setStep(prev => ({ ...prev, password: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep(prev => ({ 
                    ...prev, 
                    showPasswordInput: false,
                    password: '' 
                  }))}
                  disabled={loading}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-brand-gray">
            还没有账户？{' '}
            <Link href="/register" className="text-brand-primary hover:underline font-medium">
              立即注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
