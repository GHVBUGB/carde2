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
      setError('جميع الحقول مطلوبة')
      return
    }

    if (!isValidEmail(step.email)) {
      setError('يرجى إدخال عنوان بريد إلكتروني صحيح')
      return
    }

    if (!is51TalkEmail(step.email)) {
      setError('يمكن استخدام بريد 51Talk فقط للتسجيل')
      return
    }

    if (step.name.trim().length < 2) {
      setError('يجب أن يكون الاسم حرفين على الأقل')
      return
    }

    if (step.password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل')
      return
    }

    if (step.password !== step.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
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
          setError('هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول مباشرة')
          return
        }
        throw new Error(data.error || 'فشل التسجيل')
      }

      setSuccess(data.message)
      setStep(prev => ({ ...prev, showVerificationInput: true }))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الشبكة، يرجى المحاولة لاحقاً')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!step.verificationCode) {
      setError('يرجى إدخال رمز التحقق')
      return
    }

    if (step.verificationCode.length !== 6) {
      setError('رمز التحقق هو 6 أرقام')
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
        throw new Error(data.error || 'فشل التحقق')
      }

      setSuccess('تم التسجيل بنجاح! سيتم التوجه إلى صفحة تسجيل الدخول...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التحقق، يرجى المحاولة لاحقاً')
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
        throw new Error(data.error || 'فشل إعادة الإرسال')
      }

      setSuccess('تم إعادة إرسال رمز التحقق')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إعادة الإرسال، يرجى المحاولة لاحقاً')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-dark" dir="rtl">
            إنشاء حساب
          </CardTitle>
          <CardDescription className="text-brand-gray" dir="rtl">
            انضم إلى منصة بطاقة 51Talk الرقمية
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
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
                  بريد 51Talk الإلكتروني *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="اسمك@51talk.com"
                  value={step.email}
                  onChange={(e) => setStep(prev => ({ ...prev, email: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1" dir="rtl">
                  يرجى استخدام بريد 51Talk المؤسسي
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
                  الاسم *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك الحقيقي"
                  value={step.name}
                  onChange={(e) => setStep(prev => ({ ...prev, name: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1" dir="rtl">
                  سيظهر الاسم على بطاقتك الرقمية
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
                  كلمة المرور *
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                  value={step.password}
                  onChange={(e) => setStep(prev => ({ ...prev, password: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1" dir="rtl">
                  كلمة المرور 8 أحرف على الأقل، يُنصح بتضمين أحرف وأرقام
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
                  تأكيد كلمة المرور *
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="أدخل كلمة المرور مرة أخرى"
                  value={step.confirmPassword}
                  onChange={(e) => setStep(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-brand-gray mt-1" dir="rtl">
                  يجب أن تتطابق كلمات المرور
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
            </form>
          )}

          {step.showVerificationInput && (
            <div className="space-y-4">
              <div className="text-sm text-brand-gray text-center p-3 bg-brand-light/50 rounded-lg" dir="rtl">
                تم إرسال رمز التحقق إلى <span className="font-medium text-brand-dark">{step.email}</span>
                <br />
                يرجى فحص البريد الإلكتروني وإدخال رمز التحقق المكون من 6 أرقام
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
                    رمز التحقق *
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="أدخل رمز التحقق المكون من 6 أرقام"
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
                    العودة للتعديل
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 btn-primary"
                    disabled={loading || step.verificationCode.length !== 6}
                  >
                    {loading ? 'جاري التحقق...' : 'إكمال التسجيل'}
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
                  لم تستلم البريد؟ إعادة الإرسال
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-brand-gray space-y-2">
            <div dir="rtl">
              <span>لديك حساب بالفعل؟</span>{' '}
              <Link href="/login" className="text-brand-primary hover:underline font-medium">
                تسجيل الدخول الآن
              </Link>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <Link href="/admin/login" className="text-gray-600 hover:text-brand-primary hover:underline font-medium" dir="rtl">
                🔐 تسجيل دخول المدير
              </Link>
            </div>
          </div>

          <div className="text-xs text-brand-gray/80 text-center leading-relaxed" dir="rtl">
            التسجيل يعني موافقتك على
            <a href="#" className="text-brand-primary hover:underline">اتفاقية المستخدم</a>
            و
            <a href="#" className="text-brand-primary hover:underline">سياسة الخصوصية</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
