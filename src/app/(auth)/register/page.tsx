'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { is51TalkEmail, isValidEmail } from '@/lib/utils'

interface RegisterStep {
  email: string
  name: string
  password: string
  confirmPassword: string
  verificationCode: string
  showVerificationInput: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState<RegisterStep>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    showVerificationInput: false,
  })

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!step.email || !step.name || !step.password || !step.confirmPassword) {
      setError('所有字段都不能为空')
      return
    }

    if (!isValidEmail(step.email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (!is51TalkEmail(step.email)) {
      setError('只能使用51Talk邮箱注册')
      return
    }

    if (step.name.trim().length < 2) {
      setError('姓名至少需要2个字符')
      return
    }

    if (step.password.length < 8) {
      setError('密码至少需要8个字符')
      return
    }

    if (step.password !== step.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: step.email, 
          name: step.name.trim(),
          password: step.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('该邮箱已注册，请直接登录')
          return
        }
        throw new Error(data.error || '注册失败')
      }

      setSuccess(data.message)
      setStep(prev => ({ ...prev, showVerificationInput: true }))

    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请稍后重试')
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

    if (step.verificationCode.length !== 6) {
      setError('验证码为6位数字')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: step.email,
          name: step.name.trim(),
          password: step.password,
          code: step.verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '验证失败')
      }

      setSuccess('注册成功！即将跳转到登录页...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: step.email, 
          name: step.name.trim(),
          password: step.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '重发失败')
      }

      setSuccess('验证码已重新发送')

    } catch (err) {
      setError(err instanceof Error ? err.message : '重发失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-dark">
            创建账户
          </CardTitle>
          <CardDescription className="text-brand-gray">
            加入51Talk数字名片平台
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
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                  51Talk邮箱 *
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
                <p className="text-xs text-brand-gray mt-1">
                  请使用您的51Talk企业邮箱
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
                  姓名 *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入您的真实姓名"
                  value={step.name}
                  onChange={(e) => setStep(prev => ({ ...prev, name: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1">
                  姓名将显示在您的数字名片上
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2">
                  密码 *
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码（至少8位）"
                  value={step.password}
                  onChange={(e) => setStep(prev => ({ ...prev, password: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1">
                  密码至少8个字符，建议包含字母、数字
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                  确认密码 *
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={step.confirmPassword}
                  onChange={(e) => setStep(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1">
                  两次输入的密码必须一致
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? '发送中...' : '发送验证码'}
              </Button>
            </form>
          )}

          {step.showVerificationInput && (
            <div className="space-y-4">
              <div className="text-sm text-brand-gray text-center p-3 bg-brand-light/50 rounded-lg">
                验证码已发送至 <span className="font-medium text-brand-dark">{step.email}</span>
                <br />
                请查收邮件并输入6位验证码
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-brand-dark mb-2">
                    验证码 *
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入6位验证码"
                    value={step.verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setStep(prev => ({ ...prev, verificationCode: value }))
                    }}
                    disabled={loading}
                    className="w-full text-center text-lg tracking-widest"
                    maxLength={6}
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
                    返回修改
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 btn-primary"
                    disabled={loading || step.verificationCode.length !== 6}
                  >
                    {loading ? '验证中...' : '完成注册'}
                  </Button>
                </div>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-brand-primary hover:underline disabled:opacity-50"
                >
                  没收到邮件？重新发送
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-brand-gray space-y-2">
            <div>
              已有账户？{' '}
              <Link href="/login" className="text-brand-primary hover:underline font-medium">
                立即登录
              </Link>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <Link href="/admin/login" className="text-gray-600 hover:text-brand-primary hover:underline font-medium">
                🔐 管理员登录
              </Link>
            </div>
          </div>

          <div className="text-xs text-brand-gray/80 text-center leading-relaxed">
            注册即表示您同意我们的
            <a href="#" className="text-brand-primary hover:underline">用户协议</a>
            和
            <a href="#" className="text-brand-primary hover:underline">隐私政策</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
